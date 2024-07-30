/* eslint-disable @next/next/no-img-element */
"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import SwitchNetwork from "../SwitchNetwork";

const Header = () => {
  const pathname = usePathname();

  const isDashboardLayout = useMemo(() => {
    return pathname.includes("/dashboard");
  }, [pathname]);

  return (
    <header className="bg-light-100 border-b border-grey-200 sticky top-0 z-[2]">
      {isDashboardLayout ? (
        <div className="flex items-center">
          <div className="w-[230px] flex justify-center items-center border-r border-grey-200 py-4 ">
            <img src="/logo.png" alt="utxo global" className="w-[80px]" />
          </div>
          <div className="flex-1 flex justify-end items-center pr-6">
            <SwitchNetwork />
          </div>
        </div>
      ) : (
        <div className="container py-4 flex justify-between">
          <img src="/logo.png" alt="utxo global" className="w-[80px]" />
          <SwitchNetwork />
        </div>
      )}
    </header>
  );
};

export default Header;
