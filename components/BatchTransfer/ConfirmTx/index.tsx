"use client";

import Button from "@/components/Common/Button";
import useCells from "@/hooks/useCell";
import useCreateTransaction from "@/hooks/useCreateTransaction";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { selectApp } from "@/redux/features/app/reducer";
import { useAppSelector } from "@/redux/hook";
import { BatchTransferType } from "@/types/account";
import api from "@/utils/api";
import { FIXED_FEE, formatNumber, shortAddress } from "@/utils/helpers";
import { BI } from "@ckb-lumos/lumos";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { event } from "@/utils/gtag";
import { toast } from "react-toastify";
import { ccc } from "@ckb-ccc/connector-react";
import { cccA } from "@ckb-ccc/connector-react/advanced";

const ConfirmBatchTransferTx = ({
  txInfo,
  onBack,
}: {
  txInfo: BatchTransferType;
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
  const { usableCells, loading: cellLoading } = useCells();
  const [loading, setLoading] = useState(cellLoading);

  const { createTxBatchTransferCKB, createTxBatchTransferToken } =
    useCreateTransaction();

  const totalAmount = useMemo(() => {
    return txInfo.tos.reduce((total, to) => total + to.amount, 0);
  }, [txInfo.tos]);

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
            action: "tnx_batch_send",
            from_address: txInfo.from,
            to_address: txInfo.tos,
            network: appConfig.network,
            amount: totalAmount,
            coin: txInfo.token?.symbol ?? "CKB",
          });
        } catch (e) {
          console.log(e);
        }

        router.push(`/account/${account?.multi_sig_address}/transactions`);
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
        ? await createTxBatchTransferToken(txInfo)
        : await createTxBatchTransferCKB(txInfo);

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
  }, [txInfo, account, appConfig.isTestnet, usableCells]);

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
            {shortAddress(txInfo.from, 15)}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 items-center">
          <div className="text-[18px] leading-[24px] font-medium text-grey-400">
            Recipients: {txInfo.tos.length} addresses
          </div>
          <div className="flex flex-col text-[16px] leading-[20px] text-dark-100 mt-4 max-h-[300px] overflow-y-auto">
            {txInfo.tos.map((to, idx) => (
              <div
                className="w-full flex justify-between items-center gap-4 p-2"
                key={`to-address-${idx}`}
              >
                <p className="w-[70%]">{shortAddress(to.address, 20)}</p>
                <p>
                  {formatNumber(to.amount)}{" "}
                  {txInfo.token ? txInfo.token.symbol : "CKB"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Total Amount:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100 text-right">
            {formatNumber(totalAmount)}{" "}
            {txInfo.token ? txInfo.token.symbol : "CKB"}
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Fee:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100 text-right">
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

export default ConfirmBatchTransferTx;
