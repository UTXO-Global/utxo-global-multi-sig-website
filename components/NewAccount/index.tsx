"use client";

import { useState } from "react";

import LineStep from "./LineStep";
import Step01 from "./Step01";
import Step02 from "./Step02";
import Step03 from "./Step03";
import Success from "./Success";

const NewAccount = ({ onCancel }: { onCancel: () => void }) => {
  const [step, setStep] = useState<number>(1);
  const [isCreated, setIsCreated] = useState<boolean>(false);

  return (
    <div>
      <h6 className="text-[30px] leading-[32px] text-dark-100 font-bold text-center">
        Create New Account
      </h6>
      <div className="pt-6 pb-8 mt-6 bg-light-100 rounded-lg">
        <LineStep step={step} />
        <div className="mt-8">
          {step === 1 ? (
            <Step01 onNext={() => setStep(2)} onCancel={onCancel} />
          ) : null}
          {step === 2 ? (
            <Step02 onNext={() => setStep(3)} onCancel={() => setStep(1)} />
          ) : null}
          {step === 3 ? (
            <Step03
              onNext={() => setIsCreated(true)}
              onCancel={() => setStep(2)}
            />
          ) : null}
        </div>
      </div>
      <Success
        isModalOpen={isCreated}
        setIsModalOpen={(val) => setIsCreated(val)}
      />
    </div>
  );
};

export default NewAccount;
