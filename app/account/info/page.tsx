/* eslint-disable @next/next/no-img-element */
"use client";

import { useContext, useMemo } from "react";
import Link from "next/link";

import IcnCopy from "@/public/icons/icn-copy.svg";
import IcnExternalLink from "@/public/icons/icn-external-link.svg";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnSpinner from "@/public/icons/icn-spinner.svg";

import {
  shortAddress,
  copy,
  inviteStatus,
  getAddressBookName,
} from "@/utils/helpers";
import { EXPLORER } from "@/configs/common";
import cn from "@/utils/cn";

import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { InviteStatus } from "@/types/account";
import { selectAddressBook } from "@/redux/features/address-book/reducer";
import { AppContext } from "@/providers/app";

const Info = () => {
  const { address: currentAddress } = useContext(AppContext);
  const { info: account, isInfoLoading: isLoading } =
    useAppSelector(selectAccountInfo);

  const { data: addressBooks } = useAppSelector(selectAddressBook);

  const invites = useMemo(() => {
    return account?.invites?.filter((k) => k.status !== InviteStatus.Accepted);
  }, [account?.invites]);

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <IcnSpinner className="w-10 animate-spin" />
          </div>
        ) : !account ? null : (
          <>
            <div className="p-6 pb-2 rounded-lg bg-light-100">
              <h3 className="text-[18px] leading-[24px] font-medium text-dark-100">
                Manage Account Signers
              </h3>
              <div className="mt-4">
                {account.signers_detail?.map((z, i) => (
                  <div
                    key={`signer-${i}`}
                    className={cn(
                      `py-4 flex justify-between items-center border-b border-grey-300`,
                      {
                        "border-transparent":
                          account && account.signers_detail
                            ? account.signers_detail?.length - 1 &&
                              invites?.length === 0
                            : false,
                      }
                    )}
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src="/images/account.png"
                        alt="account"
                        className="w-10"
                      />
                      <div>
                        <p className="text-[16px] leading-[20px] font-medium">
                          {i === 0
                            ? "Owner"
                            : getAddressBookName(
                                z.signer_address,
                                addressBooks,
                                currentAddress
                              )}
                        </p>
                        <div className="flex items-center">
                          <p className="text-[14px] leading-[18px] text-grey-400">
                            {shortAddress(z.signer_address, 14)}
                          </p>
                          <div
                            className="p-1 hover:bg-grey-300 cursor-pointer ml-2 transition-colors rounded-full"
                            onClick={() => copy(z.signer_address)}
                          >
                            <IcnCopy className="w-4" />
                          </div>
                          <Link
                            href={`${EXPLORER}/address/${z.signer_address}`}
                            className="p-1 hover:bg-grey-300 cursor-pointer transition-colors rounded-full"
                          >
                            <IcnExternalLink className="w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                        <IcnPencil className="w-4 fill-grey-400" />
                      </div>
                    </div>
                  </div>
                ))}
                {invites?.map((z, i) => (
                  <div
                    key={`invite-${i}`}
                    className={cn(
                      `py-4 flex justify-between items-center border-b border-grey-300`,
                      {
                        "border-transparent": i === invites.length - 1,
                      }
                    )}
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src="/images/account.png"
                        alt="account"
                        className="w-10"
                      />
                      <div>
                        <p className="text-[16px] leading-[20px] font-medium">
                          {getAddressBookName(z.signer_address, addressBooks, currentAddress)}
                        </p>
                        <div className="flex items-center">
                          <p className="text-[14px] leading-[18px] text-grey-400">
                            {shortAddress(z.signer_address, 14)}
                          </p>
                          <div
                            className="p-1 hover:bg-grey-300 cursor-pointer ml-2 transition-colors rounded-full"
                            onClick={() => copy(z.signer_address)}
                          >
                            <IcnCopy className="w-4" />
                          </div>
                          <Link
                            href={`${EXPLORER}/address/${z.signer_address}`}
                            className="p-1 hover:bg-grey-300 cursor-pointer transition-colors rounded-full"
                          >
                            <IcnExternalLink className="w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className={cn(
                          `px-2 py-1 bg-[#F8F5F3] text-[12px] leading-[16px] text-orange-100 rounded-lg`,
                          {
                            "text-error-100":
                              z.status === InviteStatus.Rejected,
                          }
                        )}
                      >
                        {inviteStatus(z.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-light-100 mt-4">
              <h3 className="text-[18px] leading-[24px] font-medium text-dark-100">
                Required Confirmations
              </h3>
              <p className="text-[16px] leading-[20px] text-grey-400 mt-2">
                Any transaction requires the confirmation of:
              </p>
              <p className="mt-[18px] text-[16px] leading-[20px] font-medium">
                {account.threshold} out of {account.signers}{" "}
                {account.signers > 1 ? "signers" : "signer"}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Info;
