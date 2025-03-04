"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import LineStep from "./LineStep";
import Step01 from "./Step01";
import Step02 from "./Step02";
import Step03 from "./Step03";
import Success from "./Success";

import { MultiSigAccountType, SignerType } from "@/types/account";
import api from "@/utils/api";
import { isValidCKBAddress, isValidName } from "@/utils/helpers";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";

const NewAccount = () => {
  const [step, setStep] = useState<number>(1);
  const [accountName, setAccountName] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(2);
  const [signers, setSigners] = useState<SignerType[]>([]);
  const [accountCreated, setAccountCreated] =
    useState<MultiSigAccountType | null>(null);
  const { config } = useAppSelector(selectApp);

  const isValidSigner = useMemo(() => {
    for (let idx = 0; idx < signers.length; idx++) {
      const z = signers[idx];
      const _isValidName = isValidName(z.name);
      const _isValidAddress = isValidCKBAddress(z.address, config.network);

      if (!_isValidName || !_isValidAddress) {
        return false;
      }

      if (
        signers.some(
          (u, i) => u.name.toLowerCase() === z.name.toLowerCase() && i !== idx
        )
      ) {
        return false;
      }

      if (
        idx > 0 &&
        signers[0].address.toLowerCase() === z.address.toLowerCase()
      ) {
        return false;
      }

      if (
        signers.some(
          (u, i) =>
            u.address.toLowerCase() === z.address.toLowerCase() && i !== idx
        )
      ) {
        return false;
      }
    }
    return true;
  }, [signers, config.network]);

  const create = async () => {
    try {
      const res = await api.post("/multi-sig/new-account", {
        name: accountName,
        threshold,
        signers: signers,
      });

      if (res.data) {
        setAccountCreated(res.data);
      } else {
        toast.error(
          "Failed to create the account. Please check signer details and try again"
        );
      }
    } catch (e: any) {
      if (e && e.response && e.response.data && e.response.data.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error(e.message);
      }
    }
  };

  const handleSetStep = (step: number) => {
    switch (step) {
      case 1:
        setStep(1);
        return;
      case 2:
        if (!!accountName) {
          setStep(2);
        } else {
          return toast.error("Account name is required.");
        }
        return;
      case 3:
        if (isValidSigner) {
          setStep(3);
        } else {
          return toast.error("Invalid signers. Please check again.");
        }

        return;
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
              onNext={() => handleSetStep(2)}
              accountName={accountName}
              setAccountName={setAccountName}
            />
          ) : null}
          {step === 2 ? (
            <Step02
              threshold={threshold}
              setThreshold={setThreshold}
              onNext={() => handleSetStep(3)}
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
