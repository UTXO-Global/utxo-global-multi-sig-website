/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Common/Button";
import { SendTokenType } from "@/types/account";
import api from "@/utils/api";
import { formatNumber, shortAddress } from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";
import { BI, Cell, Indexer, WitnessArgs, helpers } from "@ckb-lumos/lumos";
import { predefined } from "@ckb-lumos/config-manager";
import { bytes, blockchain } from "@ckb-lumos/lumos/codec";
import { useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { cccA } from "@ckb-ccc/connector-react/advanced";
import { useRouter } from "next/navigation";

const { AGGRON4 } = predefined;

const ConfirmTx = ({
  txInfo,
  onBack,
}: {
  txInfo: SendTokenType;
  onBack: () => void;
}) => {
  const router = useRouter();
  const { info: account } = useAppSelector(selectAccountInfo);
  const signer = ccc.useSigner();
  const indexer = new Indexer("https://testnet.ckb.dev/rpc");

  const onSign = async () => {
    if (!signer) {
      return;
    }

    let txSkeleton = helpers.TransactionSkeleton({});

    const fromScript = helpers.parseAddress(txInfo.send_from, {
      config: AGGRON4,
    });

    const toScript = helpers.parseAddress(txInfo.send_to, {
      config: AGGRON4,
    });

    const neededCapacity = BI.from(txInfo.amount);
    let collectedSum = BI.from(0);
    const collected: Cell[] = [];

    const collector = indexer.collector({ lock: fromScript, type: "empty" });
    for await (const cell of collector.collect()) {
      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
      if (collectedSum.gte(neededCapacity)) break;
    }

    if (collectedSum.lt(neededCapacity)) {
      throw new Error("Not enough CKB");
    }

    const transferOutput: Cell = {
      cellOutput: {
        capacity: BI.from(txInfo.amount).toHexString(),
        lock: toScript,
      },
      data: "0x",
    };

    const changeOutput: Cell = {
      cellOutput: {
        capacity: collectedSum.sub(neededCapacity).toHexString(),
        lock: fromScript,
      },
      data: "0x",
    };

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...collected)
    );

    txSkeleton = txSkeleton.update("outputs", (outputs) =>
      outputs.push(transferOutput, changeOutput)
    );

    txSkeleton = txSkeleton.update("cellDeps", (cellDeps) =>
      cellDeps.push({
        outPoint: {
          txHash: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.TX_HASH,
          index: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.INDEX,
        },
        depType: AGGRON4.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.DEP_TYPE,
      })
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
          account?.mutli_sig_witness_data +
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

    const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);
    const signature = await signer.signOnlyTransaction(tx);
    const witnesses = signature.witnesses.toString();
    const payload = {
      ...cccA.JsonRpcTransformers.transactionFrom(tx),
      hash: tx.hash(),
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

    if (data && !!data.transaction_id) {
      router.push(
        `/account/transactions/?address=${account?.multi_sig_address}`
      );
    }
  };

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
            {formatNumber(txInfo.amount)} CKB
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Fee:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100">
            0.001 CKB{" "}
            {txInfo.is_include_fee && (
              <span className="text-grey-500">(Included Fee)</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 grid grid-cols-2 gap-6">
        <Button fullWidth kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button fullWidth onClick={onSign} disabled={!signer}>
          Sign
        </Button>
      </div>
    </>
  );
};

export default ConfirmTx;
