/* eslint-disable @next/next/no-img-element */
"use client";

import useMultisigBalance from "@/hooks/useMultisigBalance";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { selectApp } from "@/redux/features/app/reducer";
import { useAppSelector } from "@/redux/hook";
import { formatNumber } from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";
import { useMemo } from "react";

const Assets = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const { ckbPrice } = useAppSelector(selectApp);
  const { balance } = useMultisigBalance();
  const multisigBalance = useMemo(() => {
    return Number(ccc.fixedPointToString(balance));
  }, [balance]);

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-start">
        <div className="px-6 pt-3 pb-4 border-b-2 border-dark-100 text-[16px] leading-[20px] font-bold text-dark-100">
          Tokens
        </div>
      </div>
      <div className="py-4 px-6">
        <div className="rounded-lg bg-light-100 overflow-hidden">
          <div className="text-[16px] leading-[40px] text-grey-400 font-medium px-6 py-2 border-b border-grey-300 flex">
            <div className="w-[60%]">Asset</div>
            <div className="w-[20%]">Balance</div>
            <div className="w-[20%] text-right">Value</div>
          </div>
          <div className="px-6 py-3">
            <div className="flex items-center">
              <div className="flex items-center w-[60%] justify-start">
                <img src="/images/nervos.png" alt="ckb" className="w-8" />
                <p className="text-[14px] leading-[24px] text-dark-100 font-medium ml-2">
                  Nervos
                </p>
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%]">
                {account ? formatNumber(Number(multisigBalance)) : "--"} CKB
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%] text-right">
                ${account ? formatNumber(multisigBalance * ckbPrice) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Assets;
