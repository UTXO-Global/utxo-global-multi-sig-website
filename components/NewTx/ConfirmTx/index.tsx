/* eslint-disable @next/next/no-img-element */
"use client";

import { Switch } from "antd";
import { NumericFormat } from "react-number-format";

import SwitchNetwork from "@/components/SwitchNetwork";
import Button from "@/components/Common/Button";

const ConfirmTx = ({ onBack }: { onBack: () => void }) => {
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
            ckt1qzda0cr08m85hc8jlnfp3zer7xulej...kg6j5lda
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            To Address:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] text-dark-100">
            ckt1qzda0cr08m85hc8jlnfp3zer7xulejyw...y7tfcu
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Amount:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100">
            100 CKB
          </div>
        </div>
        <div className="pb-6 border-b border-grey-300 flex gap-4 items-center">
          <div className="w-[30%] text-[18px] leading-[24px] font-medium text-grey-400">
            Fee:
          </div>
          <div className="flex-1 text-[16px] leading-[20px] font-medium text-dark-100">
            0.001 CKB <span className="text-grey-500">(Included Fee)</span>
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 grid grid-cols-2 gap-6">
        <Button fullWidth kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button fullWidth>Sign</Button>
      </div>
    </>
  );
};

export default ConfirmTx;
