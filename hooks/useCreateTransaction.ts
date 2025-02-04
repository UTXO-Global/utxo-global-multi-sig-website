import { useMemo } from "react";
import { List } from "immutable";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppSelector } from "@/redux/hook";
import {
  CreateTransactionRes,
  BatchTransferType,
  SendTokenType,
} from "@/types/account";
import { BI, Cell, Indexer, commons, helpers } from "@ckb-lumos/lumos";
import { selectApp } from "@/redux/features/app/reducer";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import { ccc } from "@ckb-ccc/connector-react";
import { FIXED_FEE, FIXED_FEE_RATE, MIN_CAPACITY } from "@/utils/helpers";
import { blockchain, bytes } from "@ckb-lumos/lumos/codec";
import useCells from "./useCell";
import {
  addMultisigCellDeps,
  getxudtCellDeps,
  getxudtType,
  prepareMultisigWitness,
} from "@/utils/ckb";

const useCreateTransaction = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const { config: appConfig } = useAppSelector(selectApp);
  const { usableCells, loading: cellLoading } = useCells();

  const indexer = useMemo(() => {
    return new Indexer(appConfig.ckbRPC);
  }, [appConfig.ckbRPC]);

  const createTxSendCKB = async (
    data: SendTokenType
  ): Promise<CreateTransactionRes> => {
    let txSkeleton = helpers.TransactionSkeleton({
      cellProvider: indexer,
    });

    const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

    const fromScript = helpers.parseAddress(data.send_from, {
      config: lumosConfig,
    });

    const toScript = helpers.parseAddress(data.send_to, {
      config: lumosConfig,
    });

    let txFee = BI.from(data.fee || FIXED_FEE);
    const minCapacity = MIN_CAPACITY(toScript);
    let toAmount = BI.from(ccc.fixedPointFrom(data.amount.toString()));
    if (data.is_include_fee) {
      toAmount = toAmount.sub(txFee);
    }

    let neededCapacity = toAmount.add(txFee);
    let capacityChangeOutput = BI.from(0);

    let collectedSum = BI.from(0);
    const collected: Cell[] = [];
    const collector = indexer.collector({
      lock: fromScript,
      type: "empty",
    });

    let hasCellPending = false;

    for await (const cell of collector.collect()) {
      if (
        !bytes.equal(
          blockchain.Script.pack(cell.cellOutput.lock),
          blockchain.Script.pack(fromScript)
        )
      ) {
        continue;
      }

      if (
        cell.outPoint &&
        !!usableCells[cell.outPoint.txHash] &&
        usableCells[cell.outPoint.txHash] === Number(cell.outPoint.index)
      ) {
        hasCellPending = true;
        continue;
      }

      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
      capacityChangeOutput = collectedSum.sub(neededCapacity);
      if (
        collectedSum.gte(neededCapacity) &&
        (capacityChangeOutput.eq(0) || capacityChangeOutput.gt(minCapacity))
      )
        break;
    }

    if (collectedSum.lt(neededCapacity)) {
      return {
        error: hasCellPending
          ? "Insufficient balance: Some funds are locked in pending transactions. Please wait for confirmation or add more CKB."
          : "Not enough CKB",
      };
    }

    if (toAmount.lt(minCapacity)) {
      return {
        error: `The minimum amount is ${(
          minCapacity.add(data.is_include_fee ? txFee : BI.from(0)).toNumber() /
          10 ** 8
        ).toString()} CKB.`,
      };
    }

    if (capacityChangeOutput.gt(0) && capacityChangeOutput.lt(minCapacity)) {
      return {
        error: `The remaining balance in your wallet must be greater than ${(
          minCapacity.toNumber() /
          10 ** 8
        ).toString()} CKB. ${
          hasCellPending
            ? "Some funds are locked in pending transactions. Please wait for confirmation or add more CKB."
            : "Please adjust your transaction amount or add more CKB to proceed"
        }`,
      };
    }

    txSkeleton = txSkeleton
      .update("inputs", (inputs: List<Cell>) => inputs.push(...collected))
      .update("outputs", (outputs: List<Cell>) =>
        outputs.push(
          // Transfer Output
          {
            cellOutput: {
              capacity: toAmount.toHexString(),
              lock: toScript,
            },
            data: "0x",
          },
          // Change Output
          {
            cellOutput: {
              capacity: collectedSum.sub(toAmount).toHexString(),
              lock: fromScript,
            },
            data: "0x",
          }
        )
      );

    txSkeleton = addMultisigCellDeps(txSkeleton, lumosConfig);
    txSkeleton = await commons.common.payFee(
      txSkeleton,
      [data.send_from],
      txFee,
      undefined,
      {
        config: lumosConfig,
      }
    );

    txSkeleton = prepareMultisigWitness(
      txSkeleton,
      fromScript,
      account?.multi_sig_witness_data!,
      account?.threshold!
    );

    const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);
    return {
      transaction: tx,
      fee: txFee,
    };
  };

  const createTxSendToken = async (
    data: SendTokenType
  ): Promise<CreateTransactionRes> => {
    let txSkeleton = helpers.TransactionSkeleton({
      cellProvider: indexer,
    });

    const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

    const fromScript = helpers.parseAddress(data.send_from, {
      config: lumosConfig,
    });

    const toScript = helpers.parseAddress(data.send_to, {
      config: lumosConfig,
    });

    let fee: ccc.Num | null = null;

    const minCapacity = MIN_CAPACITY(toScript);
    let toAmount = BI.from(
      ccc.fixedPointFrom(data.amount.toString(), data.token?.decimal || 8)
    );

    // xUDT transfer
    let xUdtType = getxudtType(data.token?.typeScript, lumosConfig);

    const xudtCollector = indexer.collector({
      type: xUdtType,
      lock: fromScript,
    });

    const cellCollector = indexer.collector({
      lock: fromScript,
      data: "0x",
      type: "empty",
    });

    const tokensCell: Cell[] = [];
    const totalTokenBalanceNeeed = toAmount;
    let totalTokenBalance = BI.from(0);
    let totalXUDTCapacity = BI.from(0);

    for await (const cell of xudtCollector.collect()) {
      const balNum = ccc.numFromBytes(cell.data);
      totalTokenBalance = totalTokenBalance.add(BI.from(balNum));
      totalXUDTCapacity = totalXUDTCapacity.add(
        BI.from(cell.cellOutput.capacity)
      );

      tokensCell.push(cell);

      if (totalTokenBalance.gte(totalTokenBalanceNeeed)) {
        break;
      }
    }

    // Validate
    if (tokensCell.length === 0) {
      return {
        error: "Owner do not have an xUDT cell yet, please call mint first",
      };
    }

    const isAddressTypeJoy = ccc.bytesFrom(toScript.args).length > 20;
    const joyCapacityAddMore = 2_0000_0000; // 2 ckb

    const collectedCells: Cell[] = [];
    const xUDTCapacity = BI.from(tokensCell[0].cellOutput.capacity);
    let totalCapacity = BI.from(0);
    let capacityChangeOutput = BI.from(0);
    const xUDTCapacityChangeOutput = totalXUDTCapacity.sub(xUDTCapacity);

    let neededCapacity = BI.from(0);
    if (isAddressTypeJoy) {
      neededCapacity = neededCapacity.add(joyCapacityAddMore);
    }

    if (totalTokenBalance.lt(totalTokenBalanceNeeed)) {
      return { error: `${data.token?.symbol} insufficient balance` };
    }

    const xUDTCell = getxudtCellDeps(
      data.token?.typeScript?.code_hash!,
      lumosConfig
    );

    // Create Tx Skeleton
    txSkeleton = txSkeleton
      .update("inputs", (inputs: List<Cell>) => inputs.push(...tokensCell))
      .update("outputs", (outputs: List<Cell>) => {
        let recap = BI.from(tokensCell[0].cellOutput.capacity);
        if (isAddressTypeJoy) {
          recap = recap.add(joyCapacityAddMore);
        }

        // Transfer Output
        const xUdtData = ccc.numLeToBytes(
          totalTokenBalanceNeeed.toBigInt(),
          16
        );
        outputs = outputs.push({
          cellOutput: {
            capacity: recap.toHexString(),
            lock: toScript,
            type: xUdtType,
          },
          data: ccc.hexFrom(xUdtData),
        });

        // Change Amount
        const diff = totalTokenBalance.sub(totalTokenBalanceNeeed);
        const xUdtDataChange = ccc.numLeToBytes(diff.toBigInt(), 16);
        if (diff.gt(BI.from(0))) {
          neededCapacity = neededCapacity.add(xUDTCapacity);
          outputs = outputs.push({
            cellOutput: {
              capacity: xUDTCapacity.toHexString(),
              lock: fromScript,
              type: xUdtType,
            },
            data: ccc.hexFrom(xUdtDataChange),
          });
        }

        return outputs;
      });

    txSkeleton = addMultisigCellDeps(txSkeleton, lumosConfig, [xUDTCell]);
    // Calculate Fee and Add more CKB input for paying gas fee
    fee =
      ccc.Transaction.fromLumosSkeleton(txSkeleton).estimateFee(FIXED_FEE_RATE);
    neededCapacity = neededCapacity.add(fee);

    for await (const cell of cellCollector.collect()) {
      if (cell.data !== "0x") {
        continue;
      }

      if (
        txSkeleton.inputs.some(
          (input: Cell) =>
            input.outPoint?.txHash === cell.outPoint?.txHash &&
            input.outPoint?.index === cell.outPoint?.index
        )
      ) {
        continue;
      }

      collectedCells.push(cell);
      totalCapacity = totalCapacity.add(BI.from(cell.cellOutput.capacity));
      capacityChangeOutput = xUDTCapacityChangeOutput.add(
        totalCapacity.sub(neededCapacity)
      );
      if (
        totalCapacity.gte(neededCapacity) &&
        (capacityChangeOutput.eq(0) || capacityChangeOutput.gt(minCapacity))
      )
        break;
    }

    if (totalCapacity.lt(neededCapacity)) {
      return {
        error: `Insufficient balance. The required amount is ${(
          neededCapacity.toNumber() /
          10 ** 8
        ).toString()} CKB. Please add more CKB to proceed`,
      };
    }

    if (capacityChangeOutput.gt(0) && capacityChangeOutput.lt(minCapacity)) {
      return {
        error: `The remaining balance in your wallet must be greater than ${(
          minCapacity.toNumber() /
          10 ** 8
        ).toString()} CKB. Please adjust your transaction amount or add more CKB to proceed`,
      };
    }

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...collectedCells)
    );

    if (capacityChangeOutput.gt(0)) {
      txSkeleton = txSkeleton.update("outputs", (outputs) =>
        outputs.push({
          cellOutput: {
            capacity: capacityChangeOutput.toHexString(),
            lock: fromScript,
          },
          data: "0x",
        })
      );
    }

    txSkeleton = prepareMultisigWitness(
      txSkeleton,
      fromScript,
      account?.multi_sig_witness_data!,
      account?.threshold!
    );

    return {
      transaction: ccc.Transaction.fromLumosSkeleton(txSkeleton),
      fee: BI.from(fee),
    };
  };

  const createTxBatchTransferCKB = async (
    data: BatchTransferType
  ): Promise<CreateTransactionRes> => {
    let txSkeleton = helpers.TransactionSkeleton({
      cellProvider: indexer,
    });

    const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

    const fromScript = helpers.parseAddress(data.from, {
      config: lumosConfig,
    });

    let txFee = BI.from(data.fee || FIXED_FEE);
    let totalAmount = data.tos.reduce((total, to) => total + to.amount, 0);
    let toAmount = BI.from(ccc.fixedPointFrom(totalAmount.toString()));
    const minCapacity = BI.from(63_0000_0000);

    let neededCapacity = toAmount.add(txFee);
    let capacityChangeOutput = BI.from(0);

    let collectedSum = BI.from(0);
    const collected: Cell[] = [];
    const collector = indexer.collector({
      lock: fromScript,
      type: "empty",
    });

    let hasCellPending = false;

    for await (const cell of collector.collect()) {
      if (
        !bytes.equal(
          blockchain.Script.pack(cell.cellOutput.lock),
          blockchain.Script.pack(fromScript)
        )
      ) {
        continue;
      }

      if (
        cell.outPoint &&
        !!usableCells[cell.outPoint.txHash] &&
        usableCells[cell.outPoint.txHash] === Number(cell.outPoint.index)
      ) {
        hasCellPending = true;
        continue;
      }

      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
      capacityChangeOutput = collectedSum.sub(neededCapacity);
      if (
        collectedSum.gte(neededCapacity) &&
        (capacityChangeOutput.eq(0) || capacityChangeOutput.gt(minCapacity))
      )
        break;
    }

    // Validate
    if (collectedSum.lt(neededCapacity)) {
      return {
        error: hasCellPending
          ? "Insufficient balance: Some funds are locked in pending transactions. Please wait for confirmation or add more CKB."
          : "Not enough CKB",
      };
    }

    if (toAmount.lt(minCapacity)) {
      return {
        error: `The minimum amount is ${(
          minCapacity.add(data.is_include_fee ? txFee : BI.from(0)).toNumber() /
          10 ** 8
        ).toString()} CKB.`,
      };
    }

    if (capacityChangeOutput.gt(0) && capacityChangeOutput.lt(minCapacity)) {
      return {
        error: `The remaining balance in your wallet must be greater than ${(
          minCapacity.toNumber() /
          10 ** 8
        ).toString()} CKB. ${
          hasCellPending
            ? "Some funds are locked in pending transactions. Please wait for confirmation or add more CKB."
            : "Please adjust your transaction amount or add more CKB to proceed"
        }`,
      };
    }

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...collected)
    );
    for (let i = 0; i < data.tos.length; i++) {
      const info = data.tos[i];
      const toScript = helpers.parseAddress(info.address, {
        config: lumosConfig,
      });
      txSkeleton = txSkeleton.update("outputs", (outputs) =>
        outputs.push({
          cellOutput: {
            capacity: BI.from(
              ccc.fixedPointFrom(info.amount.toString())
            ).toHexString(),
            lock: toScript,
          },
          data: "0x",
        })
      );
    }

    txSkeleton = txSkeleton.update("outputs", (outputs) =>
      outputs.push({
        cellOutput: {
          capacity: collectedSum.sub(toAmount).toHexString(),
          lock: fromScript,
        },
        data: "0x",
      })
    );

    txSkeleton = addMultisigCellDeps(txSkeleton, lumosConfig);
    txSkeleton = await commons.common.payFee(
      txSkeleton,
      [data.from],
      txFee,
      undefined,
      {
        config: lumosConfig,
      }
    );

    txSkeleton = prepareMultisigWitness(
      txSkeleton,
      fromScript,
      account?.multi_sig_witness_data!,
      account?.threshold!
    );

    const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);
    return {
      transaction: tx,
      fee: txFee,
    };
  };

  const createTxBatchTransferToken = async (
    data: BatchTransferType
  ): Promise<CreateTransactionRes> => {
    let txSkeleton = helpers.TransactionSkeleton({
      cellProvider: indexer,
    });

    const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

    const fromScript = helpers.parseAddress(data.from, {
      config: lumosConfig,
    });

    let fee: ccc.Num | null = null;

    const minCapacity = BI.from(63_0000_0000);
    let totalAmount = data.tos.reduce((total, to) => total + to.amount, 0);
    let toAmount = BI.from(
      ccc.fixedPointFrom(totalAmount.toString(), data.token?.decimal || 8)
    );

    // xUDT transfer
    let xUdtType = getxudtType(data.token?.typeScript!, lumosConfig);

    const xudtCollector = indexer.collector({
      type: xUdtType,
      lock: fromScript,
    });

    const cellCollector = indexer.collector({
      lock: fromScript,
      data: "0x",
      type: "empty",
    });

    const tokensCell: Cell[] = [];
    const totalTokenBalanceNeeed = toAmount;
    let totalTokenBalance = BI.from(0);
    let totalXUDTCapacity = BI.from(0);

    for await (const cell of xudtCollector.collect()) {
      const balNum = ccc.numFromBytes(cell.data);
      totalTokenBalance = totalTokenBalance.add(BI.from(balNum));
      totalXUDTCapacity = totalXUDTCapacity.add(
        BI.from(cell.cellOutput.capacity)
      );

      tokensCell.push(cell);

      if (totalTokenBalance.gte(totalTokenBalanceNeeed)) {
        break;
      }
    }

    // Validate
    if (tokensCell.length === 0) {
      return {
        error: "Owner do not have an xUDT cell yet, please call mint first",
      };
    }

    const collectedCells: Cell[] = [];
    const xUDTCapacity = BI.from(tokensCell[0].cellOutput.capacity);
    let totalCapacity = BI.from(0);
    let capacityChangeOutput = BI.from(0);
    const xUDTCapacityChangeOutput = totalXUDTCapacity.sub(xUDTCapacity);

    let neededCapacity = BI.from(0);

    if (totalTokenBalance.lt(totalTokenBalanceNeeed)) {
      return { error: `${data.token?.symbol} insufficient balance` };
    }

    const xUDTCell = getxudtCellDeps(
      data.token?.typeScript.code_hash!,
      lumosConfig
    );

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...tokensCell)
    );

    for (let i = 0; i < data.tos.length; i++) {
      const info = data.tos[i];
      const toScript = helpers.parseAddress(info.address, {
        config: lumosConfig,
      });
      const isAddressTypeJoy = ccc.bytesFrom(toScript.args).length > 20;
      const joyCapacityAddMore = 2_0000_0000; // 2 ckb
      if (isAddressTypeJoy) {
        neededCapacity = neededCapacity.add(joyCapacityAddMore);
      }

      txSkeleton = txSkeleton.update("outputs", (outputs) => {
        let recap = BI.from(xUDTCapacity);
        if (isAddressTypeJoy) {
          recap = recap.add(joyCapacityAddMore);
        }

        let amount = BI.from(
          ccc.fixedPointFrom(info.amount.toString(), data.token?.decimal || 8)
        );

        const xUdtData = ccc.numLeToBytes(amount.toBigInt(), 16);

        return outputs.push({
          cellOutput: {
            capacity: recap.toHexString(),
            lock: toScript,
            type: xUdtType,
          },
          data: ccc.hexFrom(xUdtData),
        });
      });
    }

    if (data.tos.length && data.tos.length > 1) {
      neededCapacity = neededCapacity.add(
        xUDTCapacity.mul(BI.from(data.tos.length - 1))
      );
    }

    txSkeleton = addMultisigCellDeps(txSkeleton, lumosConfig, [xUDTCell]);

    // Change Amount
    const diff = totalTokenBalance.sub(totalTokenBalanceNeeed);
    if (diff.gt(BI.from(0))) {
      const xUdtDataChange = ccc.numLeToBytes(diff.toBigInt(), 16);
      neededCapacity = neededCapacity.add(xUDTCapacity);
      txSkeleton = txSkeleton.update("outputs", (outputs) =>
        outputs.push({
          cellOutput: {
            capacity: xUDTCapacity.toHexString(),
            lock: fromScript,
            type: xUdtType,
          },
          data: ccc.hexFrom(xUdtDataChange),
        })
      );
    }

    // Calculate Fee and Add more CKB input for paying gas fee
    fee =
      ccc.Transaction.fromLumosSkeleton(txSkeleton).estimateFee(FIXED_FEE_RATE);
    neededCapacity = neededCapacity.add(fee);

    for await (const cell of cellCollector.collect()) {
      if (cell.data !== "0x") {
        continue;
      }

      if (
        txSkeleton.inputs.some(
          (input) =>
            input.outPoint?.txHash === cell.outPoint?.txHash &&
            input.outPoint?.index === cell.outPoint?.index
        )
      ) {
        continue;
      }

      collectedCells.push(cell);
      totalCapacity = totalCapacity.add(BI.from(cell.cellOutput.capacity));
      capacityChangeOutput = xUDTCapacityChangeOutput.add(
        totalCapacity.sub(neededCapacity)
      );
      if (
        totalCapacity.gte(neededCapacity) &&
        (capacityChangeOutput.eq(0) || capacityChangeOutput.gt(minCapacity))
      )
        break;
    }

    if (capacityChangeOutput.gt(0) && capacityChangeOutput.lt(minCapacity)) {
      return {
        error: `The remaining balance in your wallet must be greater than ${(
          minCapacity.toNumber() /
          10 ** 8
        ).toString()} CKB. Please adjust your transaction amount or add more CKB to proceed`,
      };
    }

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...collectedCells)
    );

    if (capacityChangeOutput.gt(0)) {
      txSkeleton = txSkeleton.update("outputs", (outputs) =>
        outputs.push({
          cellOutput: {
            capacity: capacityChangeOutput.toHexString(),
            lock: fromScript,
          },
          data: "0x",
        })
      );
    }

    txSkeleton = prepareMultisigWitness(
      txSkeleton,
      fromScript,
      account?.multi_sig_witness_data!,
      account?.threshold!
    );

    return {
      transaction: ccc.Transaction.fromLumosSkeleton(txSkeleton),
      fee: BI.from(fee),
    };
  };

  return {
    createTxSendCKB,
    createTxSendToken,
    createTxBatchTransferCKB,
    createTxBatchTransferToken,
  };
};

export default useCreateTransaction;
