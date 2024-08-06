/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import IcnCopy from "@/public/icons/icn-copy.svg";
import IcnExternalLink from "@/public/icons/icn-external-link.svg";
import Button from "@/components/Common/Button";
import { SignerType } from "@/types/account";
import { shortAddress, copy } from "@/utils/helpers";

import { NETWORK_NAME } from "@/configs/network";
import { EXPLORER, NETWORK } from "@/configs/common";

const Step03 = ({
  onCreate,
  onCancel,
  accountName,
  signers,
  threshold,
}: {
  onCreate: () => void;
  onCancel: () => void;
  accountName: string;
  signers: SignerType[];
  threshold: number;
}) => {
  return (
    <div>
      <h6 className="text-[24px] leading-[28px] font-medium text-center px-16 text-orange-100">
        Review New Account
      </h6>
      <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2 px-16">
        You’re about to create a new Account and will have to confirm <br />
        the transaction with connected wallet
      </p>
      <div className="mt-6 pt-5 border-t border-grey-200 px-16">
        <div className="pb-8 border-b border-grey-200">
          <div className="flex gap-[100px] items-center py-[20px]">
            <div className="w-[114px] text-[18px] leading-[24px] font-medium text-grey-400">
              Name
            </div>
            <div className="flex-1 text-base text-dark-100 font-medium">
              {accountName}
            </div>
          </div>

          <div className="flex gap-[100px] items-center py-[20px]">
            <div className="w-[114px] text-[18px] leading-[24px] font-medium text-grey-400">
              Network
            </div>
            <div className="flex-1 text-base text-dark-100 font-medium flex gap-[10px] items-center">
              <img src="/images/nervos.png" alt="nervos" className="w-[38px]" />
              <p>{NETWORK_NAME[NETWORK]}</p>
            </div>
          </div>

          <div className="flex gap-[100px] items-start py-[20px]">
            <div className="w-[114px] text-[18px] leading-[24px] font-medium text-grey-400 mt-2">
              Signers
            </div>
            <div className="flex-1 text-base text-dark-100 items-center grid gap-4">
              {signers.map((z, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex gap-2 items-center">
                    <img
                      src="/images/account.png"
                      alt="account"
                      className="w-[38px]"
                    />
                    <p className="text-[18px] leading-[24px] text-dark-100">
                      {shortAddress(z.address, 14)}
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                      <IcnCopy
                        className="w-4"
                        onClick={() => copy(z.address)}
                      />
                    </div>

                    <Link
                      href={`${EXPLORER}/address/${z.address}`}
                      target="_blank"
                      className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer"
                    >
                      <IcnExternalLink className="w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-[100px] items-center py-[20px]">
            <div className="w-[114px] text-[18px] leading-[24px] font-medium text-grey-400">
              Threshold
            </div>
            <div className="flex-1 text-base text-dark-100 font-medium flex gap-[10px] items-center">
              {threshold} out of {signers.length}{" "}
              {signers.length > 1 ? "signers" : "signer"}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 px-16 grid grid-cols-2 gap-4">
        <Button kind="secondary" onClick={() => onCancel()}>
          Back
        </Button>
        <Button onClick={() => onCreate()}>Create</Button>
      </div>
    </div>
  );
};

export default Step03;
