"use client";

import { useState } from "react";

import LineStep from "./LineStep";
import Step01 from "./Step01";
import Step02 from "./Step02";
import Step03 from "./Step03";
import Success from "./Success";

import { MultiSigAccountType, SignerType } from "@/types/account";
import api from "@/utils/api";

const NewAccount = () => {
  const [step, setStep] = useState<number>(1);
  const [accountName, setAccountName] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(1);
  const [signers, setSigners] = useState<SignerType[]>([]);
  const [accountCreated, setAccountCreated] =
    useState<MultiSigAccountType | null>(null);

  const create = async () => {
    try {
      const { data } = await api.post("/multi-sig/new-account", {
        name: accountName,
        threshold,
        signers: signers,
      });
      setAccountCreated(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h6 className="text-[30px] leading-[32px] text-dark-100 font-bold text-center">
        Create New Account
      </h6>
      <div className="pt-6 pb-8 mt-6 bg-light-100 rounded-lg">
        <LineStep step={step} />
        <div className="mt-8">
          {step === 1 ? (
            <Step01
              onNext={() => setStep(2)}
              accountName={accountName}
              setAccountName={setAccountName}
            />
          ) : null}
          {step === 2 ? (
            <Step02
              threshold={threshold}
              setThreshold={setThreshold}
              onNext={() => setStep(3)}
              onCancel={() => setStep(1)}
              signers={signers}
              setSigners={setSigners}
            />
          ) : null}
          {step === 3 ? (
            <Step03
              accountName={accountName}
              signers={signers}
              threshold={threshold}
              onCreate={() => create()}
              onCancel={() => setStep(2)}
            />
          ) : null}
        </div>
      </div>
      <Success
        account={accountCreated as any}
        isModalOpen={!!accountCreated}
        setIsModalOpen={(val) => {}}
      />
    </div>
  );
};

export default NewAccount;
