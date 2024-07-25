import { useState } from "react";
import Link from "next/link";

import Button from "@/components/Common/Button";
import SwitchNetwork from "@/components/SwitchNetwork";
import IcnInfoOutline from "@/public/icons/icn-info-outline.svg";

import { MAIN_SITE_URL } from "@/configs/common";

const Step01 = ({
  onNext,
  onCancel,
}: {
  onNext: () => void;
  onCancel: () => void;
}) => {
  const [nameVal, setNameVal] = useState<string>("");

  const onChangeName = (e: any) => {
    setNameVal(e.target.value);
  };

  return (
    <div>
      <h6 className="text-[24px] leading-[28px] font-medium text-center px-16 text-orange-100">
        Select Network And Name Of Your Account
      </h6>
      <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2 px-16">
        Select the nework on which to create your Multi-Sig Account
      </p>
      <div className="mt-6 px-16">
        <div className="border-b border-grey-200 grid gap-2 pb-[48px]">
          <p className="text-base text-grey-500">Name</p>
          <div className="flex gap-2">
            <div className="rounded-lg border border-grey-200 px-4 py-[19px] flex items-center gap-10 flex-1">
              <input
                type="text"
                className="flex-1 border-none outline-none"
                placeholder="Enter the name"
                value={nameVal}
                onChange={onChangeName}
              />
              <IcnInfoOutline className="w-6" />
            </div>
            <div className="rounded-lg border border-grey-200 px-4 py-[15px]">
              <SwitchNetwork iconClassname="w-8 h-8" />
            </div>
          </div>
          <p className="text-[16px] leading-[20px] text-dark-100">
            By continuing, you agree to our{" "}
            <Link
              href={`${MAIN_SITE_URL}/terms-and-conditions`}
              target="_blank"
              className="text-orange-100 hover:underline"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href={`${MAIN_SITE_URL}/privacy-policy`}
              target="_blank"
              className="text-orange-100 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <div className="pt-8 px-16 grid grid-cols-2 gap-4">
        <Button kind="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={nameVal === ""} onClick={() => onNext()}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step01;
