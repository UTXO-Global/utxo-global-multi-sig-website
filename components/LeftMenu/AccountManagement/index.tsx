import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "antd";

import Button from "@/components/Common/Button";
import Account from "@/components/ListAccounts/Account";
import IcnSpinner from "@/public/icons/icn-spinner.svg";

import useListAccounts from "@/hooks/useListAccounts";
import useInvitation from "@/hooks/useInvitation";
import InvitationAccount from "@/components/ListAccounts/InvitationAccount";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { isAddressEqual } from "@/utils/helpers";

const AccountManagement = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
}) => {
  const {
    accounts,
    isLoading: isAccountsLoading,
    load: loadAccounts,
  } = useListAccounts();
  const {
    invites,
    isLoading: isInvitesLoading,
    load: loadInvites,
  } = useInvitation();

  const { info: account } = useAppSelector(selectAccountInfo);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className="account-management"
        width={350}
        closeIcon={false}
        footer={null}
        zIndex={4}
      >
        <div className="bg-light-100 h-[calc(100vh-69.71px)]">
          <div className="px-4 py-5 flex items-center justify-between border-b border-grey-300">
            <p className="text-[14px] leading-[20px] font-bold text-dark-100">
              Multi-Sign Accounts
            </p>
            <Link href="/">
              <Button
                size="small"
                className="!text-[12px] !leading-[18px] !py-[6px]"
              >
                Create Account
              </Button>
            </Link>
          </div>
          <div className="px-4 py-2">
            <p className="text-[14px] leading-[20px] font-medium text-dark-100">
              Accounts{" "}
              <span className="text-grey-500">
                {accounts.length > 0 ? `(${accounts.length})` : null}
              </span>
            </p>
            <div className="mt-4 grid gap-4 max-h-[300px] overflow-y-auto">
              {isAccountsLoading ? (
                <div className="py-[13px] flex justify-center">
                  <IcnSpinner className="w-6 fill-dark-100 animate-spin" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-4 flex justify-center text-[12px] leading-[18px] text-grey-500">
                  {`You don't have any account yet`}
                </div>
              ) : (
                accounts.map((z, i) => (
                  <Account
                    key={i}
                    account={z}
                    refresh={loadAccounts}
                    isActive={
                      account
                        ? isAddressEqual(
                            account?.multi_sig_address as any,
                            z.multi_sig_address
                          )
                        : false
                    }
                    isSmall
                  />
                ))
              )}
            </div>
            <p className="text-[14px] leading-[20px] font-medium text-dark-100 mt-6">
              Invitation List{" "}
              <span className="text-grey-500">
                {invites.length > 0 ? `(${invites.length})` : null}
              </span>
            </p>
            <div className="mt-4 grid gap-4 max-h-[300px] overflow-y-auto">
              {isInvitesLoading ? (
                <div className="py-[13px] flex justify-center">
                  <IcnSpinner className="w-6 fill-dark-100 animate-spin" />
                </div>
              ) : invites.length === 0 ? (
                <div className="py-4 flex justify-center text-[12px] leading-[18px] text-grey-500">
                  {`You don't have any invitation yet`}
                </div>
              ) : (
                invites.map((z, i) => (
                  <InvitationAccount
                    isSmall
                    key={i}
                    account={z}
                    refresh={loadInvites}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccountManagement;
