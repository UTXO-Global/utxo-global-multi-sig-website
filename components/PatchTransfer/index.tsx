"use client";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppSelector } from "@/redux/hook";
import { BatchTransferType } from "@/types/account";
import { FIXED_FEE, FIXED_FEE_RATE } from "@/utils/helpers";
import { useEffect, useState } from "react";
import cn from "@/utils/cn";
import ConfirmBatchTransferTx from "./ConfirmTx";
import CreateBatchTransferTx from "./CreateManualTx";

const BatchTransfer = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const [step, setStep] = useState<number>(1);
  const [txInfo, setTxInfo] = useState<BatchTransferType>({
    from: account?.multi_sig_address!,
    tos: [],
    is_include_fee: false,
    network: "",
    fee: FIXED_FEE,
    feeRate: FIXED_FEE_RATE,
  });

  useEffect(() => {
    if (account) {
      setTxInfo((prev) => ({ ...prev, from: account.multi_sig_address }));
    }
  }, [account, setTxInfo]);
  return (
    <>
      <div className="w-full h-1 bg-[#D9D9D9] absolute top-0 left-0"></div>
      <div
        className={cn(`w-2/3 h-1 bg-orange-100 absolute top-0 left-0`, {
          "w-full": step === 2,
        })}
      ></div>
      {step === 1 ? (
        <CreateBatchTransferTx
          txInfo={txInfo}
          setTxInfo={setTxInfo}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <ConfirmBatchTransferTx txInfo={txInfo} onBack={() => setStep(1)} />
      ) : null}
    </>
  );
};

export default BatchTransfer;
