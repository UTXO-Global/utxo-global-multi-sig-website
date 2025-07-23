/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";

import Button from "../Common/Button";
import ReceiveTokens from "../ReceiveTokens";
import Faucet from "./Faucet";

import cn from "@/utils/cn";
import IcnCopyBold from "@/public/icons/icn-copy-bold.svg";
import IcnExternalLinkBold from "@/public/icons/icn-external-link-bold.svg";
import AccountManagement from "./AccountManagement";

import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { shortAddress, copy, formatNumber } from "@/utils/helpers";
import useMultisigBalance from "@/hooks/useMultisigBalance";
import { ccc } from "@ckb-ccc/connector-react";
import { SHORT_NETWORK_NAME } from "@/configs/network";
import { selectApp } from "@/redux/features/app/reducer";
import { event } from "@/utils/gtag";
import {
  IcnAccountInfo,
  IcnAsset,
  IcnBatchTransfer,
  IcnTransaction,
} from "./Icon";

const LeftMenu = () => {
  const pathname = usePathname();
  const params = useParams();
  const address = params.address;

  const [isShowAccountManagement, setIsShowAccountManagement] =
    useState<boolean>(false);

  const { info: account, isInfoLoading } = useAppSelector(selectAccountInfo);
  const { balance: multisigBalance } = useMultisigBalance();
  const { config } = useAppSelector(selectApp);
  const isPathActive = (pageRegex: string) => {
    if (!pageRegex) {
      return /^\/account\/[^/]+\/?$/.test(pathname);
    }

    return new RegExp(`/account\/[^/]+\/${pageRegex}/`).test(pathname);
  };

  useEffect(() => {
    console.log(account);
  }, [account]);

  useEffect(() => {
    try {
      event({
        action: "wallet_tvl",
        address: account?.multi_sig_address,
        network: config.network,
        amount: Number(ccc.fixedPointToString(multisigBalance)),
      });
    } catch (e) {
      console.log(e);
    }
  }, [account?.multi_sig_address, config.network, multisigBalance]);

  return (
    <div className="w-[230px] bg-light-100 border-r border-grey-200 relative">
      <div
        className="absolute top-10 -right-4 w-8 aspect-square rounded-full bg-light-100 border border-grey-300 flex justify-center items-center transition-colors hover:bg-[#FFF7F1] cursor-pointer"
        onClick={() => setIsShowAccountManagement(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6.66656 4L5.72656 4.94L8.7799 8L5.72656 11.06L6.66656 12L10.6666 8L6.66656 4Z"
            fill="#787575"
          />
        </svg>
      </div>
      <AccountManagement
        isModalOpen={isShowAccountManagement}
        setIsModalOpen={setIsShowAccountManagement}
      />
      <div className="p-4 grid gap-4 border-b border-grey-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/images/multi-sig-account.png"
              alt="account"
              className="w-[40px] rounded-full"
            />
            <div className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full text-[8px] text-dark-100 font-medium flex justify-center items-center bg-[#FFD5B3]">
              {account?.threshold}/{account?.signers}
            </div>
          </div>
          <div className="flex-1">
            {isInfoLoading ? (
              <>
                <div className="w-[40px] h-[16px] my-[2px] rounded-lg bg-grey-300 animate-pulse"></div>
                <div className="w-[80%] h-[16px] rounded-lg bg-grey-300 animate-pulse mt-[7px]"></div>
                <div className="w-[80%] h-[16px] rounded-lg bg-grey-300 animate-pulse mt-[7px]"></div>
              </>
            ) : (
              <>
                <p className="text-[16px] leading-[20px] font-bold text-dark-100">
                  {account?.name}
                </p>
                <p className="text-[14px] leading-[20px] font-medium text-grey-400 mt-[2px]">
                  <span className="text-dark-100">
                    {SHORT_NETWORK_NAME[config.network]}:{" "}
                  </span>
                  {shortAddress(account?.multi_sig_address, 5)}
                </p>
                <p className="text-[14px] leading-[20px] font-medium text-grey-400 mt-[2px]">
                  {account
                    ? formatNumber(
                        Number(ccc.fixedPointToString(multisigBalance))
                      )
                    : "--"}{" "}
                  CKB
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {account ? <ReceiveTokens account={account} /> : null}

          <div
            className="w-8 aspect-square rounded-[4px] transition-colors hover:bg-grey-200 bg-grey-300 flex justify-center items-center cursor-pointer"
            onClick={() => copy(account?.multi_sig_address as any)}
          >
            <IcnCopyBold className="w-4" />
          </div>
          <Link
            href={`${config.explorer}/address/${account?.multi_sig_address}`}
            target="_blank"
            className="w-8 aspect-square rounded-[4px] transition-colors hover:bg-grey-200 bg-grey-300 flex justify-center items-center cursor-pointer"
          >
            <IcnExternalLinkBold className="w-4" />
          </Link>
          <Faucet />
        </div>
        <Link href={`/account/${address}/new-transaction/`}>
          <Button className="" size="small" fullWidth>
            New Transaction
          </Button>
        </Link>
      </div>
      <div className="px-4 py-2 grid gap-1 text-[14px] leading-[20px] font-medium text-dark-100">
        <Link
          href={`/account/${address}`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center gap-4 cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": isPathActive(""),
            }
          )}
        >
          <IcnAsset />
          <span>Assets</span>
        </Link>
        <Link
          href={`/account/${address}/transactions`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center justify-between cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": isPathActive("transactions"),
            }
          )}
        >
          <div className="flex gap-4 items-center">
            <IcnTransaction />
            <span>Transactions</span>
          </div>
          {account && account?.totalTxPending > 0 ? (
            <div className="w-4 h-4 aspect-square rounded-full bg-error-100 text-light-100 flex justify-center items-center text-[10px]">
              {account?.totalTxPending}
            </div>
          ) : null}
        </Link>
        <Link
          href={`/account/${address}/batch-transfer`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center justify-between cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": isPathActive("batch-transfer"),
            }
          )}
        >
          <div className="flex gap-4 items-center">
            <IcnBatchTransfer />
            <span>Batch Transfer</span>
          </div>
        </Link>
        <Link
          href={`/account/${address}/info`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center gap-4 cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300": isPathActive("info"),
            }
          )}
        >
          <IcnAccountInfo />
          <span>Account Info</span>
        </Link>
      </div>
    </div>
  );
};

export default LeftMenu;
