import { useMemo } from "react";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppSelector } from "@/redux/hook";
import { CreateTransactionRes, SendTokenType } from "@/types/account";
import {
  BI,
  Cell,
  Indexer,
  Script,
  WitnessArgs,
  commons,
  helpers,
} from "@ckb-lumos/lumos";
import { selectApp } from "@/redux/features/app/reducer";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import { ccc } from "@ckb-ccc/connector-react";
import { FIXED_FEE, FIXED_FEE_RATE, MIN_CAPACITY } from "@/utils/helpers";
import { blockchain, bytes } from "@ckb-lumos/lumos/codec";
import useCells from "./useCell";

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

    // Validate
    if (collectedSum.lt(neededCapacity)) {
      return {
        error: hasCellPending
          ? "Insufficient balance: Some funds are locked in pending transactions. Please wait for confirmation or add more CKB."
          : "Not enough CKB",
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
      .update("inputs", (inputs) => inputs.push(...collected))
      .update("outputs", (outputs) =>
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
      )
      .update("cellDeps", (cellDeps) =>
        cellDeps.push(
          ...[
            {
              outPoint: {
                txHash: lumosConfig.SCRIPTS.DAO?.TX_HASH!,
                index: "0x3",
              },
              depType: lumosConfig.SCRIPTS.DAO?.DEP_TYPE!,
            },
            {
              outPoint: {
                txHash:
                  lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.TX_HASH!,
                index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.INDEX!,
              },
              depType:
                lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.DEP_TYPE!,
            },
          ]
        )
      );

    txSkeleton = await commons.common.payFee(
      txSkeleton,
      [data.send_from],
      txFee,
      undefined,
      {
        config: lumosConfig,
      }
    );

    const firstIndex = txSkeleton
      .get("inputs")
      .findIndex((input) =>
        bytes.equal(
          blockchain.Script.pack(input.cellOutput.lock),
          blockchain.Script.pack(fromScript)
        )
      );

    if (firstIndex !== -1) {
      while (txSkeleton.get("witnesses").size < txSkeleton.get("inputs").size) {
        txSkeleton = txSkeleton.update("witnesses", (witnesses) =>
          witnesses.push("0x")
        );
      }

      let witness: string = txSkeleton.get("witnesses").get(firstIndex)!;
      const SECP_SIGNATURE_PLACEHOLDER = "00".repeat(65);

      let newWitnessArgs: WitnessArgs = {
        lock: `0x${
          account?.multi_sig_witness_data
        }${SECP_SIGNATURE_PLACEHOLDER.repeat(account?.threshold!)}`,
      };

      if (witness !== "0x") {
        const witnessArgs = blockchain.WitnessArgs.unpack(
          bytes.bytify(witness)
        );
        const lock = witnessArgs.lock;
        if (
          !!lock &&
          !!newWitnessArgs.lock &&
          !bytes.equal(lock, newWitnessArgs.lock)
        ) {
          return {
            error: "Lock field in first witness is set aside for signature!",
          };
        }

        const inputType = witnessArgs.inputType;
        if (!!inputType) {
          newWitnessArgs.inputType = inputType;
        }

        const outputType = witnessArgs.outputType;
        if (!!outputType) {
          newWitnessArgs.outputType = outputType;
        }
      }

      witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
      txSkeleton = txSkeleton.update("witnesses", (witnesses) =>
        witnesses.set(firstIndex, witness)
      );
    }

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
    let toAmount = data.amount * 10 ** (data.token?.decimal || 8);

    // xUDT transfer
    const { args, code_hash, hash_type } = data.token?.typeScript!;
    const isRUSD = lumosConfig.SCRIPTS.RUSD?.CODE_HASH === code_hash;

    let xUdtType = {
      codeHash: isRUSD ? lumosConfig.SCRIPTS.RUSD?.CODE_HASH : code_hash,
      hashType: isRUSD ? lumosConfig.SCRIPTS.RUSD?.HASH_TYPE : hash_type,
      args,
    } as Script;

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
    const totalTokenBalanceNeeed = BI.from(toAmount);
    let totalTokenBalance = BI.from(0);

    for await (const cell of xudtCollector.collect()) {
      const balNum = ccc.numFromBytes(cell.data);
      totalTokenBalance = totalTokenBalance.add(BI.from(balNum));
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
    let totalCapacity = BI.from(0);
    let capacityChangeOutput = BI.from(0);
    const xUDTCapacity = BI.from(tokensCell[0].cellOutput.capacity);
    let neededCapacity = BI.from(0);
    if (totalTokenBalance.lt(totalTokenBalanceNeeed)) {
      return { error: `${data.token?.symbol} insufficient balance` };
    }

    const xUDTCell = {
      outPoint: {
        txHash: isRUSD
          ? lumosConfig.SCRIPTS.RUSD!.TX_HASH
          : lumosConfig.SCRIPTS.XUDT!.TX_HASH,
        index: isRUSD
          ? lumosConfig.SCRIPTS.RUSD!.INDEX
          : lumosConfig.SCRIPTS.XUDT!.INDEX,
      },
      depType: isRUSD
        ? lumosConfig.SCRIPTS.RUSD!.DEP_TYPE
        : lumosConfig.SCRIPTS.XUDT!.DEP_TYPE,
    };

    // Create Tx Skeleton
    txSkeleton = txSkeleton
      .update("inputs", (inputs) => inputs.push(...tokensCell))
      .update("outputs", (outputs) => {
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
          if (isAddressTypeJoy) {
            neededCapacity = neededCapacity.add(joyCapacityAddMore);
          }
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
      })
      .update("cellDeps", (cellDeps) =>
        cellDeps.push(
          ...[
            xUDTCell,
            {
              outPoint: {
                txHash:
                  lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.TX_HASH!,
                index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.INDEX!,
              },
              depType:
                lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.DEP_TYPE!,
            },
            {
              outPoint: {
                txHash: lumosConfig.SCRIPTS.DAO?.TX_HASH!,
                index: "0x3",
              },
              depType: lumosConfig.SCRIPTS.DAO?.DEP_TYPE!,
            },
          ]
        )
      );

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
      capacityChangeOutput = totalCapacity.sub(neededCapacity);
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
    const firstIndex = txSkeleton
      .get("inputs")
      .findIndex((input) =>
        bytes.equal(
          blockchain.Script.pack(input.cellOutput.lock),
          blockchain.Script.pack(fromScript)
        )
      );

    if (firstIndex !== -1) {
      while (txSkeleton.get("witnesses").size < txSkeleton.get("inputs").size) {
        txSkeleton = txSkeleton.update("witnesses", (witnesses) =>
          witnesses.push("0x")
        );
      }

      let witness: string = txSkeleton.get("witnesses").get(firstIndex)!;
      const SECP_SIGNATURE_PLACEHOLDER = "00".repeat(65);

      let newWitnessArgs: WitnessArgs = {
        lock:
          "0x" +
          account?.multi_sig_witness_data +
          SECP_SIGNATURE_PLACEHOLDER.repeat(account?.threshold!),
      };

      if (witness !== "0x") {
        const witnessArgs = blockchain.WitnessArgs.unpack(
          bytes.bytify(witness)
        );
        const lock = witnessArgs.lock;
        if (
          !!lock &&
          !!newWitnessArgs.lock &&
          !bytes.equal(lock, newWitnessArgs.lock)
        ) {
          return {
            error: "Lock field in first witness is set aside for signature!",
          };
        }

        const inputType = witnessArgs.inputType;
        if (!!inputType) {
          newWitnessArgs.inputType = inputType;
        }

        const outputType = witnessArgs.outputType;
        if (!!outputType) {
          newWitnessArgs.outputType = outputType;
        }
      }

      witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
      txSkeleton = txSkeleton.update("witnesses", (witnesses) =>
        witnesses.set(firstIndex, witness)
      );
    }

    return {
      transaction: ccc.Transaction.fromLumosSkeleton(txSkeleton),
      fee: BI.from(fee),
    };
  };

  return {
    createTxSendCKB,
    createTxSendToken,
  };
};

export default useCreateTransaction;
