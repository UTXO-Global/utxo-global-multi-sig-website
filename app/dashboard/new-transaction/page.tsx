/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

import cn from "@/utils/cn";
import CreateTx from "@/components/NewTx/CreateTx";
import ConfirmTx from "@/components/NewTx/ConfirmTx";

const NewTransaction = () => {
  const [step, setStep] = useState<number>(1);

  return (
    <main className="h-full overflow-y-auto">
      <div className="py-6 max-w-[633px] mx-auto bg-light-100 mt-[76px] rounded-lg overflow-hidden relative">
        <div className="w-full h-1 bg-[#D9D9D9] absolute top-0 left-0"></div>
        <div
          className={cn(`w-2/3 h-1 bg-orange-100 absolute top-0 left-0`, {
            "w-full": step === 2,
          })}
        ></div>
        {step === 1 ? <CreateTx onNext={() => setStep(2)} /> : null}
        {step === 2 ? <ConfirmTx onBack={() => setStep(1)} /> : null}
      </div>
    </main>
  );
};

export default NewTransaction;
