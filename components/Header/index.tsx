/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import useLogin from "@/hooks/useLogin";
import useLoadAddressBooks from "@/hooks/useLoadAddressBooks";

import AccountModal from "../AccountModal";
import SwitchNetwork from "../SwitchNetwork";

const PAGE_TITLE: { [key: string]: string } = {
  "/account/new-transaction/": "New Transaction",
  "/account/transactions/": "Transactions",
  "/account/assets/": "Assets",
  "/account/info/": "Account Info",
};

const Header = () => {
  useLogin();
  useLoadAddressBooks();

  const pathname = usePathname();

  const isDashboardLayout = useMemo(() => {
    return pathname.includes("/account");
  }, [pathname]);

  const pageTitle = useMemo(() => {
    return PAGE_TITLE[pathname];
  }, [pathname]);

  return (
    <header className="bg-light-100 border-b border-grey-200 sticky top-0 z-[1000]">
      {isDashboardLayout ? (
        <div className="flex items-center">
          <div className="w-[230px] flex justify-center items-center border-r border-grey-200 py-4 ">
            <Link href="/">
              <img src="/logo.png" alt="utxo global" className="w-[80px]" />
            </Link>
          </div>
          <div className="flex-1 flex justify-between items-center px-6">
            <p className="text-[24px] leading-[28px] font-bold text-dark-100">
              {pageTitle}
            </p>
            <div className="flex">
              <AccountModal />

              <SwitchNetwork />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 flex justify-between">
          <img src="/logo.png" alt="utxo global" className="w-[80px]" />
          <div className="flex">
            <AccountModal />
            <SwitchNetwork />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
