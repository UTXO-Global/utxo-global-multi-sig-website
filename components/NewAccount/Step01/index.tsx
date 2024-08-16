import { useEffect, useState } from "react";
import Link from "next/link";

import Button from "@/components/Common/Button";
import SwitchNetwork from "@/components/SwitchNetwork";

import { MAIN_SITE_URL } from "@/configs/common";
import { isValidName } from "@/utils/helpers";
import cn from "@/utils/cn";

const Step01 = ({
  onNext,
  accountName,
  setAccountName,
}: {
  onNext: () => void;
  accountName: string;
  setAccountName: (val: string) => void;
}) => {
  const [error, setError] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const onChangeName = (e: any) => {
    setAccountName(e.target.value);
  };

  const next = () => {
    setIsSubmit(true);
    if (!error) onNext();
  };

  useEffect(() => {
    setError(!isValidName(accountName));
  }, [accountName]);

  return (
    <div>
      <h6 className="text-[24px] leading-[28px] font-medium text-center px-16 text-orange-100">
        Enter Your Account Name and Select The Network
      </h6>
      <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2 px-16">
        Select the nework on which to create your Multi-Sig Account
      </p>
      <div className="mt-6 px-16">
        <div className="border-b border-grey-200 grid gap-2 pb-[48px]">
          <p className="text-base text-grey-500">Name</p>
          <div className="flex gap-2">
            <div
              className={cn(
                `rounded-lg border border-grey-200 px-4 py-[19px] flex items-center gap-10 flex-1`,
                {
                  "border-error-100": isSubmit && error,
                }
              )}
            >
              <input
                type="text"
                className="flex-1 border-none outline-none placeholder:text-grey-400"
                placeholder="Enter the name"
                value={accountName}
                onChange={onChangeName}
              />
            </div>
            <div className="rounded-lg border border-grey-200 px-4 py-[15px]">
              <SwitchNetwork iconClassname="w-8 h-8" />
            </div>
          </div>
          {isSubmit && error ? (
            <p className="text-sm text-error-100">
              Account name must be be between 4 and 16 character and contain
              only letters, numbers, and underscores.
            </p>
          ) : null}

          <p className="text-[16px] leading-[20px] text-dark-100">
            By continuing, you agree to our{" "}
            <Link
              href={`${MAIN_SITE_URL}/terms-and-conditions`}
              target="_blank"
              className="text-orange-100 underline"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href={`${MAIN_SITE_URL}/privacy-policy`}
              target="_blank"
              className="text-orange-100 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <div className="pt-8 px-16 grid grid-cols-2 gap-4">
        <Link href="/" className="w-full">
          <Button kind="secondary" fullWidth>
            Cancel
          </Button>
        </Link>

        <Button disabled={isSubmit && error} onClick={() => next()}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step01;
