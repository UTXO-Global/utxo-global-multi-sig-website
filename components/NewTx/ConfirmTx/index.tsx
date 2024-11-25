/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Common/Button";
import { SendTokenType } from "@/types/account";
import api from "@/utils/api";
import {
  FIXED_FEE_RATE,
  formatNumber,
  getInputsCapacity,
  getOutputsCapacity,
  INOUT_SIZE_BYTE,
  shortAddress,
} from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";
import {
  BI,
  Cell,
  Indexer,
  WitnessArgs,
  helpers,
  commons,
  Script,
} from "@ckb-lumos/lumos";
import { bytes, blockchain } from "@ckb-lumos/lumos/codec";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { cccA } from "@ckb-ccc/connector-react/advanced";
import { useRouter } from "next/navigation";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import { selectApp } from "@/redux/features/app/reducer";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const ConfirmTx = ({
  txInfo,
  onBack,
}: {
  txInfo: SendTokenType;
  onBack: () => void;
}) => {
  const [transaction, setTransaction] = useState<ccc.Transaction | undefined>(
    undefined
  );

  const [txFee, setTxFee] = useState(BI.from(100000)); // TODO: Set dynamic fee = 0.001
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const { info: account } = useAppSelector(selectAccountInfo);
  const { config: appConfig } = useAppSelector(selectApp);
  const signer = ccc.useSigner();
  const indexer = useMemo(() => {
    return new Indexer(appConfig.ckbRPC);
  }, [appConfig.ckbRPC]);

  const onSign = async () => {
    if (!signer) {
      return;
    }

    if (!transaction) return;
    setLoading(true);
    try {
      const signature = await signer.signOnlyTransaction(transaction);
      const witnesses = signature.witnesses.toString();
      const payload = {
        ...cccA.JsonRpcTransformers.transactionFrom(transaction),
        hash: transaction.hash(),
      };

      const { data } = await api.post("/multi-sig/new-transfer", {
        payload: JSON.stringify(payload, (_, value) => {
          if (typeof value === "bigint") {
            return `0x${value.toString(16)}`;
          }
          return value;
        }),
        signature: witnesses.slice(42),
      });
      setLoading(false);

      if (data && !!data.transaction_id) {
        router.push(
          `/account/transactions/?address=${account?.multi_sig_address}`
        );
      } else if (!!data.message) {
        toast.error(data.message);
      }
    } catch (e: any) {
      const message: string = (
        e.response?.data?.message || e.message
      ).toString();
      if (
        message.includes(
          `duplicate key value violates unique constraint "transactions_pkey"`
        )
      ) {
        toast.error(
          `Transaction with hash ${transaction.hash()} is still pending. Please complete it before creating a new transaction`
        );
      } else {
        toast.error(message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const f = async () => {
      if (!txInfo || !account) return;
      let txSkeleton = helpers.TransactionSkeleton({
        cellProvider: indexer,
      });

      const lumosConfig = appConfig.isTestnet ? AGGRON4 : LINA;

      const fromScript = helpers.parseAddress(txInfo.send_from, {
        config: lumosConfig,
      });

      const toScript = helpers.parseAddress(txInfo.send_to, {
        config: lumosConfig,
      });

      let fee: ccc.Num | null = null;

      if (txInfo.token) {
        let toAmount = txInfo.amount * 10 ** txInfo.token.decimal;

        // xUDT transfer
        const { args, code_hash, hash_type } = txInfo.token.typeScript;
        const xUdtType = {
          codeHash: code_hash,
          hashType: hash_type,
          args,
        } as Script;

        const xudtCollector = indexer.collector({
          type: xUdtType,
          lock: fromScript,
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
          const errorMsg =
            "Owner do not have an xUDT cell yet, please call mint first";
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        const xUDTCapacity = BI.from(tokensCell[0].cellOutput.capacity); // TODO
        if (totalTokenBalance.lt(totalTokenBalanceNeeed)) {
          const errorMsg = `${txInfo.token.symbol} insufficient balance`;
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        // Create Tx Skeleton
        txSkeleton = txSkeleton
          .update("inputs", (inputs) => inputs.push(...tokensCell))
          .update("outputs", (outputs) => {
            // Transfer Output
            const xUdtData = ccc.numLeToBytes(
              totalTokenBalanceNeeed.toBigInt(),
              16
            );
            outputs = outputs.push({
              cellOutput: {
                capacity: xUDTCapacity.toHexString(),
                lock: toScript,
                type: xUdtType,
              },
              data: ccc.hexFrom(xUdtData),
            });

            // Change Amount
            const diff = totalTokenBalance.sub(totalTokenBalanceNeeed);
            const xUdtDataChange = ccc.numLeToBytes(diff.toBigInt(), 16);
            if (diff.gt(BI.from(0))) {
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
                {
                  outPoint: {
                    txHash:
                      lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.TX_HASH!,
                    index:
                      lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.INDEX!,
                  },
                  depType:
                    lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.DEP_TYPE!,
                },
                {
                  outPoint: {
                    txHash: lumosConfig.SCRIPTS.XUDT!.TX_HASH,
                    index: lumosConfig.SCRIPTS.XUDT!.INDEX,
                  },
                  depType: lumosConfig.SCRIPTS.XUDT!.DEP_TYPE,
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
          ccc.Transaction.fromLumosSkeleton(txSkeleton).estimateFee(
            FIXED_FEE_RATE
          );
        let inputCapacity = getInputsCapacity(txSkeleton).add(fee);
        let outputCapacity = getOutputsCapacity(txSkeleton);

        if (inputCapacity.lt(outputCapacity)) {
          const emptyTypeCellCollector = indexer.collector({
            lock: fromScript,
            data: "0x",
            type: "empty",
          });

          // Assume these append inputs and outputs has size = 500 bytes = INOUT_SIZE_BYTE
          // => Fee increase = INOUT_SIZE_BYTE * FIXED_FEE_RATE / 1024
          const feeCapacityForeachInout = Math.ceil(
            (INOUT_SIZE_BYTE * FIXED_FEE_RATE) / 1024
          );

          for await (const cell of emptyTypeCellCollector.collect()) {
            if (inputCapacity.lt(outputCapacity)) {
              txSkeleton = txSkeleton.update("inputs", (inputs) =>
                inputs.push(cell)
              );
              inputCapacity = inputCapacity
                .add(cell.cellOutput.capacity)
                .add(BI.from(feeCapacityForeachInout));
            }

            if (inputCapacity.gt(outputCapacity)) {
              const changeCapacity = inputCapacity.sub(outputCapacity);
              // Ignore if change amount is too small
              if (changeCapacity.gt(feeCapacityForeachInout)) {
                txSkeleton = txSkeleton.update("outputs", (outputs) =>
                  outputs.push({
                    cellOutput: {
                      capacity: changeCapacity
                        .sub(feeCapacityForeachInout)
                        .toHexString(),
                      lock: fromScript,
                    },
                    data: "0x",
                  })
                );
              }
              break;
            }
          }
        }

        // Recalculate Fee Again
        fee =
          ccc.Transaction.fromLumosSkeleton(txSkeleton).estimateFee(
            FIXED_FEE_RATE
          );
        setTxFee(BI.from(fee));
      } else {
        // CKB transfer
        let toAmount = BI.from(ccc.fixedPointFrom(txInfo.amount.toString()));
        if (txInfo.is_include_fee) {
          toAmount = toAmount.sub(txFee);
        }
        const neededCapacity = toAmount.add(txFee);

        let collectedSum = BI.from(0);
        const collected: Cell[] = [];
        const collector = indexer.collector({
          lock: fromScript,
          type: "empty",
        });
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
          if (collectedSum.gte(neededCapacity)) break;
        }

        // Validate
        if (collectedSum.lt(neededCapacity)) {
          setError("Not enough CKB");
          throw new Error("Not enough CKB");
        }

        // Create Tx Skeleton
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
                    txHash:
                      lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.TX_HASH!,
                    index:
                      lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.INDEX!,
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
        while (firstIndex >= txSkeleton.get("witnesses").size) {
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
            setError("Lock field in first witness is set aside for signature!");
            throw new Error(
              "Lock field in first witness is set aside for signature!"
            );
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

      txSkeleton = await commons.common.payFee(
        txSkeleton,
        [txInfo.send_from],
        txFee,
        undefined,
        { config: lumosConfig }
      );

      const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);
      setTransaction(tx);
    };

    setLoading(true);
    f();
    setLoading(false);
  }, [txInfo, account, indexer, appConfig.isTestnet]);

  useEffect(() => {
    if (!error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      <p className="text-[24px] leading-[28px] font-medium text-dark-100 px-6 border-b border-grey-300 pb-4">
        Confirm Transaction
      </p>
      <div className="pt-8 px-6 grid gap-4">
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            From Address:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] text-dark-100">
            {shortAddress(txInfo.send_from, 15)}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            To Address:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] text-dark-100">
            {shortAddress(txInfo.send_to, 15)}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Amount:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100">
            {formatNumber(txInfo.amount)} {txInfo.token?.symbol ?? "CKB"}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Fee:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100">
            {formatNumber(txFee.toNumber() / 10 ** 8, 2, 8)} CKB
            {!txInfo.token && txInfo.is_include_fee && (
              <span className="text-grey-500"> (Included Fee)</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 grid grid-cols-2 gap-6">
        <Button fullWidth kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          fullWidth
          onClick={onSign}
          disabled={!signer || !!error || loading}
        >
          {loading ? "Signing" : "Sign"}
        </Button>
      </div>
    </>
  );
};

export default ConfirmTx;
