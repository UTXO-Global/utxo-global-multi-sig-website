import { useEffect, useState } from "react";

import cn from "@/utils/cn";
import CreateTx from "./CreateTx";
import ConfirmTx from "./ConfirmTx";
import { SendTokenType } from "@/types/account";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { FIXED_FEE, FIXED_FEE_RATE } from "@/utils/helpers";

const NewTx = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const [step, setStep] = useState<number>(1);
  const [txInfo, setTxInfo] = useState<SendTokenType>({
    send_from: account?.multi_sig_address!,
    send_to: "",
    amount: 0,
    is_include_fee: false,
    network: "",
    fee: FIXED_FEE,
    feeRate: FIXED_FEE_RATE,
    isUseDID: false
  });

  useEffect(() => {
    if (account) {
      setTxInfo((prev) => ({ ...prev, send_from: account.multi_sig_address }));
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
        <CreateTx
          txInfo={txInfo}
          setTxInfo={setTxInfo}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <ConfirmTx txInfo={txInfo} onBack={() => setStep(1)} />
      ) : null}
    </>
  );
};

export default NewTx;
