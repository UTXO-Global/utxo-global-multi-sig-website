/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Common/Button";
import { SendTokenType } from "@/types/account";
import api from "@/utils/api";
import { FIXED_FEE, formatNumber, shortAddress } from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";
import { BI } from "@ckb-lumos/lumos";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { cccA } from "@ckb-ccc/connector-react/advanced";
import { useRouter } from "next/navigation";
import { selectApp } from "@/redux/features/app/reducer";
import { toast } from "react-toastify";
import useCreateTransaction from "@/hooks/useCreateTransaction";
import { event } from "@/utils/gtag";

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

  const [txFee, setTxFee] = useState(
    txInfo.fee ? BI.from(txInfo.fee) : BI.from(FIXED_FEE)
  );
  const router = useRouter();
  const [error, setError] = useState("");
  const { info: account } = useAppSelector(selectAccountInfo);
  const { config: appConfig } = useAppSelector(selectApp);
  const signer = ccc.useSigner();
  const [loading, setLoading] = useState(false);

  const { createTxSendCKB, createTxSendToken } = useCreateTransaction();

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
        signature: witnesses.slice(42, 172),
      });
      setLoading(false);

      if (data && !!data.transaction_id) {
        try {
          event({
            action: "tnx_send",
            from_address: txInfo.send_from,
            to_address: txInfo.send_to,
            network: appConfig.network,
            amount: txInfo.amount,
            coin: txInfo.token?.symbol ?? "CKB",
            did: txInfo.isUseDID,
          });
        } catch (e) {
          console.log(e);
        }

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
      if (message.includes(`transactions_pkey`)) {
        toast.error(
          `Duplicate transaction detected with hash ${transaction.hash()}. Please contact support at https://t.me/utxoglobal/12 for help`
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
      const tx = txInfo.token
        ? await createTxSendToken(txInfo)
        : await createTxSendCKB(txInfo);

      if (tx.error) {
        setError(tx.error);
      }

      if (tx.fee) {
        setTxFee(tx.fee);
      }

      setTransaction(tx.transaction);
    };

    setLoading(true);
    f();
    setLoading(false);
  }, [txInfo, account, appConfig.isTestnet]);

  useEffect(() => {
    if (!!error) {
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
            {Number(ccc.fixedPointToString(txFee.toBigInt()))} CKB
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
