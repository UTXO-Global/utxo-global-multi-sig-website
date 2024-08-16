/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Popover } from "antd";
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from "next/navigation";

import IcnChevron from "@/public/icons/icn-chevron.svg";
import IcnLogout from "@/public/icons/icn-logout.svg";

import { useAppDispatch } from "@/redux/hook";
import { reset } from "@/redux/features/storage/action";
import { reset as restAccountInfo } from "@/redux/features/account-info/action";
import useAuthenticate from "@/hooks/useAuthenticate";
import { shortAddress, formatNumber } from "@/utils/helpers";

import useSignerInfo from "@/hooks/useSignerInfo";

const AccountModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { address, balance } = useSignerInfo();

  const { isLoggedIn } = useAuthenticate();
  const { disconnect } = ccc.useCcc();

  const dispatch = useAppDispatch();

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const logout = () => {
    disconnect();
    router.push("/");
    dispatch(reset());
    dispatch(restAccountInfo());
    hide();
  };

  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100 w-[150px]">
      <div
        className="px-4 py-[10px] flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer"
        onClick={() => {
          logout();
        }}
      >
        <IcnLogout className="w-4" />
        <p>Logout</p>
      </div>
    </div>
  );

  if (!isLoggedIn) return null;

  return (
    <div className="mr-6">
      <Popover
        content={content}
        placement="bottomRight"
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        arrow={false}
      >
        <div className="flex gap-3 items-center pl-6 mr-6 relative cursor-pointer">
          <div className="w-[1px] h-[69.71px] bg-grey-200 absolute -right-6 -top-4"></div>
          <div>
            <img
              src="/images/wallet-account.png"
              alt="account"
              className="w-8"
            />
          </div>
          <div className="flex gap-6 items-center">
            <div className="">
              <p className="text-[12px] leading-[18px] font-medium">
                {shortAddress(address)}
              </p>
              <p className="text-[12px] leading-[18px] text-grey-400">
                {formatNumber(Number(ccc.fixedPointToString(balance)))} CKB
              </p>
            </div>
            <IcnChevron className="w-4" />
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default AccountModal;
