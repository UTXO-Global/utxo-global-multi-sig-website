import { useEffect, useMemo } from "react";
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
import { FIXED_FEE, FIXED_FEE_RATE, calcMinCapacity } from "@/utils/helpers";
import { blockchain, bytes } from "@ckb-lumos/lumos/codec";
import useCells from "./useCell";
import {
  addMultisigCellDeps,
  getxudtCellDeps,
  getxudtType,
  prepareMultisigWitness,
} from "@/utils/ckb";
import useTransactions from "./useTransactions";
import { TransactionStatus } from "@/types/transaction";
import { toast } from "react-toastify";

const useCreateTransaction = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const { config: appConfig } = useAppSelector(selectApp);

  const {
    isLoading: transactionLoading,
    transactions,
    load: LoadPendingTransaction,
  } = useTransactions(
    [TransactionStatus.WaitingSigned, TransactionStatus.InProgressing],
    false
  );

  const indexer = useMemo(() => {
    return new Indexer(appConfig.ckbRPC);
  }, [appConfig.ckbRPC]);

  const isTxPending = useMemo(() => {
    return false; //transactions?.length > 0;
  }, [transactions]);

  const createTxSendCKB = async (
    data: SendTokenType
  ): Promise<CreateTransactionRes> => {
    if (isTxPending) {
      return {
        error:
          "You have a pending transaction. Please complete or cancel it before creating a new one.",
      };
    }

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
    const minCapacity = calcMinCapacity(toScript);
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
    if (isTxPending) {
      return {
        error:
          "You have a pending transaction. Please complete or cancel it before creating a new one.",
      };
    }
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
    let totalTokenBalance = BI.from(0);
    let totalXUDTCapacity = BI.from(0);

    for await (const cell of xudtCollector.collect()) {
      const balNum = ccc.numFromBytes(cell.data);
      totalTokenBalance = totalTokenBalance.add(BI.from(balNum));
      totalXUDTCapacity = totalXUDTCapacity.add(
        BI.from(cell.cellOutput.capacity)
      );

      tokensCell.push(cell);

      if (totalTokenBalance.gte(toAmount)) {
        break;
      }
    }

    // Validate
    if (tokensCell.length === 0) {
      return {
        error: "Owner do not have an xUDT cell yet, please call mint first",
      };
    }

    if (totalTokenBalance.lt(toAmount)) {
      return { error: `${data.token?.symbol} insufficient balance` };
    }

    const xUDTCapacity = BI.from(tokensCell[0].cellOutput.capacity);
    const xUDTData = ccc.hexFrom(ccc.numLeToBytes(toAmount.toBigInt(), 16));
    const minRecipientCapacity = BI.from(
      helpers.minimalCellCapacity({
        cellOutput: {
          lock: toScript,
          type: xUdtType,
          capacity: "0x0",
        },
        data: xUDTData,
      })
    );

    let neededCapacity = minRecipientCapacity.sub(xUDTCapacity);
    const xUDTCell = getxudtCellDeps(
      data.token?.typeScript?.code_hash!,
      lumosConfig
    );

    // add input, output
    txSkeleton = txSkeleton
      .update("inputs", (inputs: List<Cell>) => inputs.push(...tokensCell))
      .update("outputs", (outputs: List<Cell>) => {
        // Transfer Output
        outputs = outputs.push({
          cellOutput: {
            capacity: minRecipientCapacity.toHexString(),
            lock: toScript,
            type: xUdtType,
          },
          data: xUDTData,
        });

        // Change Amount
        const diff = totalTokenBalance.sub(toAmount);
        if (diff.gt(BI.from(0))) {
          const xUdtDataChange = ccc.numLeToBytes(diff.toBigInt(), 16);
          outputs = outputs.push({
            cellOutput: {
              capacity: xUDTCapacity.toHexString(),
              lock: fromScript,
              type: xUdtType,
            },
            data: ccc.hexFrom(xUdtDataChange),
          });
          neededCapacity = neededCapacity.add(xUDTCapacity);
        }

        return outputs;
      });

    txSkeleton = addMultisigCellDeps(txSkeleton, lumosConfig, [xUDTCell]);
    const fee =
      ccc.Transaction.fromLumosSkeleton(txSkeleton).estimateFee(FIXED_FEE_RATE);
    neededCapacity = neededCapacity.add(fee);

    const collectedCells: Cell[] = [];
    let totalCapacity = BI.from(0);
    let capacityChangeOutput = BI.from(0);
    const minCapacity = calcMinCapacity(toScript);

    for await (const cell of cellCollector.collect()) {
      if (cell.data !== "0x") continue;

      if (
        txSkeleton.inputs.some(
          (i: Cell) =>
            i.outPoint?.txHash === cell.outPoint?.txHash &&
            i.outPoint?.index === cell.outPoint?.index
        )
      ) {
        continue;
      }

      collectedCells.push(cell);
      totalCapacity = totalCapacity.add(BI.from(cell.cellOutput.capacity));
      capacityChangeOutput = totalCapacity.sub(neededCapacity);
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
    if (isTxPending) {
      return {
        error:
          "You have a pending transaction. Please complete or cancel it before creating a new one.",
      };
    }
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
    const minCapForSender = helpers.minimalCellCapacity({
      cellOutput: { capacity: "0x0", lock: fromScript },
      data: "0x",
    });

    let minCapacity = BI.from(0);
    data.tos.forEach((to, idx) => {
      try {
        const toScript = helpers.parseAddress(to.address, {
          config: lumosConfig,
        });
        const minCKBbyAddr = BI.from(
          ccc.fixedPointFrom(
            helpers.minimalCellCapacity({
              cellOutput: { capacity: "0x0", lock: toScript },
              data: "0x",
            })
          )
        );

        if (minCKBbyAddr > minCapacity) {
          minCapacity = minCapacity.add(minCKBbyAddr);
        }
      } catch (error) {
        console.log(error);
      }
    });

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
        error: `The minimum amount is ${ccc.fixedPointToString(
          minCapacity.add(data.is_include_fee ? txFee : BI.from(0)).toNumber()
        )} CKB.`,
      };
    }

    if (
      capacityChangeOutput.gt(0) &&
      capacityChangeOutput.lt(minCapForSender)
    ) {
      return {
        error: `The remaining balance in your wallet must be greater than ${ccc.fixedPointToString(
          minCapForSender
        )} CKB. ${
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
    if (isTxPending) {
      return {
        error:
          "You have a pending transaction. Please complete or cancel it before creating a new one.",
      };
    }
    let txSkeleton = helpers.TransactionSkeleton({
      cellProvider: indexer,
    });

    const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

    const fromScript = helpers.parseAddress(data.from, {
      config: lumosConfig,
    });

    let fee: ccc.Num | null = null;

    const minCapForSender = helpers.minimalCellCapacity({
      cellOutput: { capacity: "0x0", lock: fromScript },
      data: "0x",
    });
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
      let amount = BI.from(
        ccc.fixedPointFrom(info.amount.toString(), data.token?.decimal || 8)
      );

      const xUDTData = ccc.hexFrom(ccc.numLeToBytes(amount.toBigInt(), 16));
      const minRecipientCapacity = BI.from(
        helpers.minimalCellCapacity({
          cellOutput: {
            lock: toScript,
            type: xUdtType,
            capacity: "0x0",
          },
          data: xUDTData,
        })
      );

      neededCapacity = neededCapacity.add(minRecipientCapacity);

      txSkeleton = txSkeleton.update("outputs", (outputs) => {
        return outputs.push({
          cellOutput: {
            capacity: minRecipientCapacity.toHexString(),
            lock: toScript,
            type: xUdtType,
          },
          data: xUDTData,
        });
      });
    }

    neededCapacity = neededCapacity.sub(xUDTCapacity);
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
        (capacityChangeOutput.eq(0) || capacityChangeOutput.gt(minCapForSender))
      )
        break;
    }

    if (
      capacityChangeOutput.gt(0) &&
      capacityChangeOutput.lt(minCapForSender)
    ) {
      return {
        error: `The remaining balance in your wallet must be greater than ${ccc.fixedPointToString(
          minCapForSender
        )} CKB. Please adjust your transaction amount or add more CKB to proceed`,
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

  useEffect(() => {
    LoadPendingTransaction(true);
  }, [account]);

  return {
    createTxSendCKB,
    createTxSendToken,
    createTxBatchTransferCKB,
    createTxBatchTransferToken,
    isTxPending: isTxPending,
    isTxLoading: transactionLoading,
  };
};

export default useCreateTransaction;
