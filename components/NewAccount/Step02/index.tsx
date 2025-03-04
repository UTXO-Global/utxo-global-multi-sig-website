/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Tooltip } from "antd";
import { ccc } from "@ckb-ccc/connector-react";
import { toast } from "react-toastify";

import IcnInfoOutline from "@/public/icons/icn-info-outline.svg";
import IcnTrash from "@/public/icons/icn-trash.svg";
import Button from "@/components/Common/Button";
import { SignerType } from "@/types/account";
import useSignerInfo from "@/hooks/useSignerInfo";
import { isValidCKBAddress, shortAddress, isValidName } from "@/utils/helpers";
import cn from "@/utils/cn";
import { SHORT_NETWORK_NAME } from "@/configs/network";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";

const Step02 = ({
  onNext,
  onCancel,
  signers,
  setSigners,
  threshold,
  setThreshold,
}: {
  onNext: () => void;
  onCancel: () => void;
  signers: SignerType[];
  setSigners: (val: SignerType[]) => void;
  threshold: number;
  setThreshold: (val: number) => void;
}) => {
  const { address, balance } = useSignerInfo();
  const [errors, setErrors] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { config } = useAppSelector(selectApp);

  const isValidSigners = useMemo(() => {
    return (
      errors.every((z) => z.name && z.address) &&
      threshold > 1 &&
      signers.length > 1
    );
  }, [errors, threshold, signers]);

  const onChangeSignerName = (e: any, index: number) => {
    setSigners(
      signers.map((z, i) => {
        if (index !== i) return z;
        return { ...z, name: e.target.value };
      })
    );
  };

  const onChangeSignerAddress = (e: any, index: number) => {
    setSigners(
      signers.map((z, i) => {
        if (index !== i) return z;
        return { ...z, address: e.target.value };
      })
    );
  };

  const addSigner = () => {
    setErrors([...errors, { name: false, address: false }]);
    setSigners([
      ...signers,
      {
        name: "",
        address: "",
      },
    ]);
  };

  const deleteSigner = (index: number) => {
    if (signers.length > 2) {
      setSigners(signers.filter((z, i) => i !== index));
    }
  };

  const validate = useCallback(() => {
    const errs = signers.map((z, i) => ({
      name: isValidName(z.name),
      address: isValidCKBAddress(z.address, config.network),
    }));

    setErrors(() => [...errs]);
  }, [signers, config.network]);

  const _isDuplicateSigner = () => {
    const set = new Set(signers.map((z) => z.address.toLowerCase()));
    return set.size !== signers.length;
  };

  const createSigners = () => {
    setIsSubmit(true);
    if (_isDuplicateSigner()) {
      toast.warning("Signer address duplicated!");
      return;
    }
    if (isValidSigners) onNext();
  };

  useEffect(() => {
    validate();
  }, [signers]);

  useEffect(() => {
    if (signers.length === 0) {
      setSigners([
        { name: "Owner", address },
        { name: "", address: "" },
      ]);
      setErrors([
        { name: true, address: true },
        { name: false, address: false },
      ]);
    } else {
      setSigners(signers.map((z, i) => (i === 0 ? { ...z, address } : z)));
    }
  }, [address]);

  return (
    <div>
      <h6 className="text-[24px] leading-[28px] font-medium text-center px-16 text-orange-100">
        Signers And Confirmations
      </h6>
      <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2 px-16">
        Set the signer wallet of your UTXO Account and how many need <br />{" "}
        confirm to execute a valid transaction
      </p>
      <div className="mt-6 pt-5 border-t border-grey-200 px-16">
        <div className="pb-8 border-b border-grey-200">
          {signers.map((z, i) => (
            <div key={i}>
              <div className="flex gap-6 mt-2">
                <div className="w-[244px]">
                  <p className="text-base text-grey-500">Signer Name</p>
                  <input
                    type="text"
                    className={cn(
                      `outline-none border border-grey-200 placeholder:text-grey-400 rounded-lg px-4 py-[19px] mt-2 w-full`,
                      {
                        "border-error-100": isSubmit && !errors[i].name,
                      }
                    )}
                    placeholder="Enter the name"
                    readOnly={i === 0}
                    value={z.name}
                    onChange={(e) => onChangeSignerName(e, i)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base text-grey-500 mb-2">Signer</p>
                  <div className="flex gap-4 items-center">
                    <div
                      className={cn(
                        `flex-1 rounded-lg border border-grey-200 px-4 py-[11px] flex items-center gap-2 relative`,
                        {
                          "border-error-100": isSubmit && !errors[i].address,
                        }
                      )}
                    >
                      <img
                        src="/images/account.png"
                        alt="account"
                        className="w-10"
                      />
                      {i === 0 ? (
                        <p className="text-[18px] leading-[24px] text-dark-100 truncate flex gap-2 items-center">
                          <span className="text-grey-500">
                            {SHORT_NETWORK_NAME[config.network]}:
                          </span>{" "}
                          <span>{shortAddress(address, 14)}</span>
                        </p>
                      ) : (
                        <div className="text-[18px] leading-[24px] text-dark-100 flex items-center gap-2 flex-1">
                          <span className="text-grey-500">
                            {SHORT_NETWORK_NAME[config.network]}:
                          </span>{" "}
                          <input
                            type="text"
                            className="outline-none border-none w-full flex-1"
                            value={z.address}
                            onChange={(e) => onChangeSignerAddress(e, i)}
                          />
                        </div>
                      )}
                    </div>
                    {i === 0 || signers.length <= 2 ? null : (
                      <div
                        className="p-2 hover:bg-grey-200 rounded-full cursor-pointer"
                        onClick={() => {
                          if (signers.length > 2) {
                            deleteSigner(i);
                          }
                        }}
                      >
                        <IcnTrash className="w-6" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {i === 0 ? (
                <p className="text-[14px] leading-[18px] text-grey-500 mt-1">
                  Your connected wallet
                </p>
              ) : null}
            </div>
          ))}

          <button
            className="rounded-lg mt-6 border-none outline-none bg-grey-300 hover:bg-grey-200 transition-colors text-orange-100 text-[16px] leading-[20px] font-medium px-4 py-3"
            onClick={addSigner}
          >
            + Add New Signer
          </button>
          {signers.length < 2 && (
            <div className="text-error-100 text-sm mt-4">
              *There must be more than one signer
            </div>
          )}
          {isSubmit && !isValidSigners ? (
            <div className="text-error-100 text-sm mt-4">
              <p>
                *Signer name must be be between 4 and 16 character and contain
                only letters, numbers, and underscores.
              </p>
              <p>*Address must be valid.</p>
            </div>
          ) : null}
        </div>
        <div className="pt-6 pb-8 border-b border-grey-200">
          <div className="flex items-center gap-2">
            <p className="text-[24px] leading-[28px] font-medium text-dark-100">
              Threshold
            </p>
            <Tooltip title="The threshold of a Multi-Sig Account specifies how many signers need to confirm a Account Transaction before it can be executed.">
              <div>
                <IcnInfoOutline className="w-5 stroke-grey-400 cursor-pointer" />
              </div>
            </Tooltip>
          </div>
          <p className="mt-1 text-[16px] leading-[20px] text-dark-100">
            Any transaction requires the confirmation of:
          </p>
          {threshold < 2 && (
            <div className="text-error-100 text-sm mt-4">
              *Threshold must be greater than one
            </div>
          )}
          <div className="flex gap-4 items-center mt-6">
            <Select
              defaultValue={threshold}
              style={{ width: 70 }}
              onChange={setThreshold}
              suffixIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.99997 9C6.80222 9.00004 6.60892 9.05871 6.44451 9.1686C6.2801 9.27848 6.15196 9.43465 6.07629 9.61735C6.00062 9.80005 5.98082 10.0011 6.01938 10.195C6.05795 10.389 6.15316 10.5671 6.29297 10.707L11.293 15.707C11.4805 15.8945 11.7348 15.9998 12 15.9998C12.2651 15.9998 12.5194 15.8945 12.707 15.707L17.707 10.707C17.8468 10.5671 17.942 10.389 17.9806 10.195C18.0191 10.0011 17.9993 9.80005 17.9236 9.61735C17.848 9.43465 17.7198 9.27848 17.5554 9.1686C17.391 9.05871 17.1977 9.00004 17 9L6.99997 9Z"
                    fill="black"
                  />
                </svg>
              }
              options={Array(signers.length > 0 ? signers.length - 1 : 0)
                .fill(0)
                .map((z, i) => ({ value: i + 2, label: i + 2 }))}
            />
            <p className="text-[18px] leading-[24px] font-medium text-dark-100">
              out of {signers.length}{" "}
              {signers.length > 1 ? "signers" : "signer"}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-8 px-16 grid grid-cols-2 gap-4">
        <Button kind="secondary" onClick={() => onCancel()}>
          Back
        </Button>
        <Button
          onClick={() => createSigners()}
          disabled={isSubmit || !isValidSigners}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step02;
