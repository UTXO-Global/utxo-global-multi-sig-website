/* eslint-disable @next/next/no-img-element */
import { Select } from "antd";

import IcnInfoOutline from "@/public/icons/icn-info-outline.svg";
import IcnTrash from "@/public/icons/icn-trash.svg";
import Button from "@/components/Common/Button";

const Step02 = ({ onNext }: { onNext: () => void }) => {
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
          <div className="flex gap-6">
            <div className="w-[244px]">
              <p className="text-base text-grey-500">Signer Name</p>
              <input
                type="text"
                className="outline-none border border-grey-200 rounded-lg px-4 py-[19px] mt-2 w-full"
                placeholder="Enter the name"
              />
            </div>
            <div className="flex-1">
              <p className="text-base text-grey-500">Signer</p>
              <div className="mt-2 rounded-lg border border-grey-200 px-4 py-[11px] flex items-center gap-2">
                <img src="/images/account.png" alt="account" className="w-10" />
                <p className="text-[18px] leading-[24px] text-dark-100 truncate">
                  <span className="text-grey-500">Pud:</span>{" "}
                  ckt1qzda0cr08m8f7xulejywt49kt...
                </p>
              </div>
            </div>
          </div>
          <p className="text-[14px] leading-[18px] text-grey-500 mt-1">
            Your connected wallet
          </p>
          <div className="flex gap-6 mt-2">
            <div className="w-[244px]">
              <p className="text-base text-grey-500">Signer Name</p>
              <input
                type="text"
                className="outline-none border border-grey-200 rounded-lg px-4 py-[19px] mt-2 w-full"
                placeholder="Enter the name"
              />
            </div>
            <div className="flex-1">
              <p className="text-base text-grey-500">Signer</p>
              <div className="mt-2 rounded-lg border border-grey-200 px-4 py-[11px] flex items-center gap-2 relative">
                <img src="/images/account.png" alt="account" className="w-10" />
                <p className="text-[18px] leading-[24px] text-dark-100 truncate">
                  <span className="text-grey-500">Pud:</span>{" "}
                  ckt1qzda0cr08m8f7xulejywt49kt...
                </p>
                <div className="p-2 absolute top-1/2 -translate-y-1/2 right-0 translate-x-[calc(100%+8px)] hover:bg-grey-200 rounded-lg cursor-pointer">
                  <IcnTrash className="w-6" />
                </div>
              </div>
            </div>
          </div>
          <button className="rounded-lg mt-6 border-none outline-none bg-grey-300 hover:bg-grey-200 transition-colors text-orange-100 text-[16px] leading-[20px] font-medium px-4 py-3">
            + Add New Signer
          </button>
        </div>
        <div className="pt-6 pb-8 border-b border-grey-200">
          <div className="flex items-center gap-2">
            <p className="text-[24px] leading-[28px] font-medium text-dark-100">
              Threshold
            </p>
            <IcnInfoOutline className="w-5 stroke-grey-400" />
          </div>
          <p className="mt-1 text-[16px] leading-[20px] text-dark-100">
            Any transaction requires the confirmation of:
          </p>
          <div className="flex gap-4 items-center mt-6">
            <Select
              defaultValue="1"
              style={{ width: 70 }}
              onChange={() => {}}
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
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />
            <p className="text-[18px] leading-[24px] font-medium text-dark-100">
              out of 1 signer
            </p>
          </div>
        </div>
      </div>
      <div className="pt-8 px-16 grid grid-cols-2 gap-4">
        <Button kind="secondary">Back</Button>
        <Button onClick={() => onNext()}>Next</Button>
      </div>
    </div>
  );
};

export default Step02;
