import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "../Common/Button";
import Account from "./Account";
import InvitationAccount from "./InvitationAccount";
import IcnSpinner from "@/public/icons/icn-spinner.svg";

import useListAccounts from "@/hooks/useListAccounts";
import useInvitation from "@/hooks/useInvitation";

const ListAccounts = () => {
  const { isLoading, accounts, load } = useListAccounts();
  const {
    isLoading: isInvitesLoading,
    invites,
    load: loadInvitation,
  } = useInvitation();

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[24px] leading-[28px] font-bold text-dark-100">
          Multi Sign Accounts
        </h3>
        <Link href="/new-account">
          <Button size="small">Create Account</Button>
        </Link>
      </div>
      <div className="px-6 py-5 rounded-lg bg-light-100">
        <p className="text-[20px] leading-[28px] font-medium text-dark-100">
          Accounts{" "}
          <span className="text-grey-400">
            {accounts.length > 0 ? `(${accounts.length})` : null}
          </span>
        </p>
        <div className="mt-[10px] grid gap-2">
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <IcnSpinner className="w-10 fill-dark-100 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="pt-[22px] pb-[28px] flex justify-center text-[16px] leading-[20px] text-grey-500">
              {`You don't have any account yet`}
            </div>
          ) : (
            accounts.map((z, i) => (
              <Account key={i} account={z} refresh={load} />
            ))
          )}
        </div>
      </div>
      <div className="px-6 py-5 rounded-lg bg-light-100">
        <p className="text-[20px] leading-[28px] font-medium text-dark-100">
          Invitation List{" "}
          <span className="text-grey-400">
            {invites.length > 0 ? `(${invites.length})` : null}
          </span>
        </p>
        <div className="mt-[10px] grid gap-2">
          {isInvitesLoading ? (
            <div className="py-6 flex justify-center">
              <IcnSpinner className="w-10 fill-dark-100 animate-spin" />
            </div>
          ) : invites.length === 0 ? (
            <div className="pt-[22px] pb-[28px] flex justify-center text-[16px] leading-[20px] text-grey-500">
              {`You don't have any invitation yet`}
            </div>
          ) : (
            invites.map((z, i) => (
              <InvitationAccount key={i} account={z} refresh={loadInvitation} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAccounts;
