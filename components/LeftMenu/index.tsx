/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

const LeftMenu = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const [isShowAccountManagement, setIsShowAccountManagement] =
    useState<boolean>(false);

  const { info: account, isInfoLoading } = useAppSelector(selectAccountInfo);
  const { balance: multisigBalance } = useMultisigBalance();
  const { config } = useAppSelector(selectApp);

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
        <Link href={`/account/new-transaction/?address=${address}`}>
          <Button className="" size="small" fullWidth>
            New Transaction
          </Button>
        </Link>
      </div>
      <div className="px-4 py-2 grid gap-1 text-[14px] leading-[20px] font-medium text-dark-100">
        <Link
          href={`/account/?address=${address}`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center gap-4 cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": pathname === "/account/",
            }
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.99922 3.33594C7.42252 3.33594 5.33252 5.42595 5.33252 8.0026C5.33252 10.5799 7.42252 12.6692 9.99922 12.6692C12.5765 12.6692 14.6659 10.5799 14.6659 8.0026C14.6659 5.42595 12.5765 3.33594 9.99922 3.33594ZM9.99887 4.66797C11.8376 4.66797 13.3322 6.1633 13.3322 8.0013C13.3322 9.83995 11.8376 11.3346 9.99887 11.3346C8.16087 11.3346 6.66557 9.83995 6.66557 8.0013C6.66557 6.1633 8.16087 4.66797 9.99887 4.66797Z"
              fill="#0D0D0D"
            />
            <path
              d="M4.53591 3.57266C2.63914 4.19698 1.33301 5.97075 1.33301 7.9979C1.33301 10.025 2.63914 11.7988 4.53591 12.4231C4.88564 12.5382 5.26245 12.348 5.3776 11.9983C5.4927 11.6486 5.3025 11.2718 4.95277 11.1566C3.59871 10.7109 2.66634 9.4448 2.66634 7.9979C2.66634 6.55105 3.59871 5.28485 4.95277 4.83915C5.3025 4.72404 5.4927 4.34721 5.3776 3.99747C5.26245 3.64774 4.88564 3.45755 4.53591 3.57266Z"
              fill="#0D0D0D"
            />
          </svg>
          <span>Assets</span>
        </Link>
        <Link
          href={`/account/transactions/?address=${address}`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center justify-between cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": pathname === "/account/transactions/",
            }
          )}
        >
          <div className="flex gap-4 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.4672 8.86465C14.2078 8.60465 13.7838 8.60465 13.5245 8.86465L11.9978 10.3913V3.99998C11.9978 3.63331 11.6978 3.33331 11.3312 3.33331C10.9638 3.33331 10.6645 3.63331 10.6645 3.99998V10.3913L9.13717 8.86465C8.87783 8.60531 8.45383 8.60531 8.1945 8.86465C7.93517 9.12398 7.93517 9.54798 8.1945 9.80731L10.8598 12.472C10.8985 12.512 10.9478 12.5333 10.9932 12.5606C11.0212 12.5773 11.0438 12.6013 11.0745 12.6146C11.1018 12.6266 11.1325 12.6266 11.1612 12.6333C11.3025 12.6713 11.4518 12.6706 11.5878 12.6146C11.6172 12.602 11.6392 12.5786 11.6665 12.562C11.7132 12.5346 11.7618 12.5126 11.8025 12.472L14.4672 9.80731C14.7265 9.54798 14.7265 9.12398 14.4672 8.86465Z"
                fill="#0D0D0D"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.80066 7.12827C7.54133 7.38827 7.11733 7.38827 6.85799 7.12827L5.33133 5.60161V11.9929C5.33133 12.3596 5.03133 12.6596 4.66466 12.6596C4.29733 12.6596 3.99799 12.3596 3.99799 11.9929V5.60161L2.47066 7.12827C2.21133 7.38761 1.78733 7.38761 1.52799 7.12827C1.26866 6.86894 1.26866 6.44494 1.52799 6.18561L4.19333 3.52094C4.23199 3.48094 4.28133 3.45961 4.32666 3.43227C4.35466 3.41561 4.37733 3.39161 4.40799 3.37827C4.43533 3.36627 4.46599 3.36627 4.49466 3.35961C4.63599 3.32161 4.78533 3.32227 4.92133 3.37827C4.95066 3.39094 4.97266 3.41427 4.99999 3.43094C5.04666 3.45827 5.09533 3.48027 5.13599 3.52094L7.80066 6.18561C8.05999 6.44494 8.05999 6.86894 7.80066 7.12827Z"
                fill="#0D0D0D"
              />
            </svg>
            <span>Transactions</span>
          </div>
          {account && account?.totalTxPending > 0 ? (
            <div className="w-4 h-4 aspect-square rounded-full bg-error-100 text-light-100 flex justify-center items-center text-[10px]">
              {account?.totalTxPending}
            </div>
          ) : null}
        </Link>
        <Link
          href={`/account/patch-transfer/?address=${address}`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center justify-between cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300 hover:pl-4": pathname === "/account/patch-transfer/",
            }
          )}
        >
          <div className="flex gap-4 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.4672 8.86465C14.2078 8.60465 13.7838 8.60465 13.5245 8.86465L11.9978 10.3913V3.99998C11.9978 3.63331 11.6978 3.33331 11.3312 3.33331C10.9638 3.33331 10.6645 3.63331 10.6645 3.99998V10.3913L9.13717 8.86465C8.87783 8.60531 8.45383 8.60531 8.1945 8.86465C7.93517 9.12398 7.93517 9.54798 8.1945 9.80731L10.8598 12.472C10.8985 12.512 10.9478 12.5333 10.9932 12.5606C11.0212 12.5773 11.0438 12.6013 11.0745 12.6146C11.1018 12.6266 11.1325 12.6266 11.1612 12.6333C11.3025 12.6713 11.4518 12.6706 11.5878 12.6146C11.6172 12.602 11.6392 12.5786 11.6665 12.562C11.7132 12.5346 11.7618 12.5126 11.8025 12.472L14.4672 9.80731C14.7265 9.54798 14.7265 9.12398 14.4672 8.86465Z"
                fill="#0D0D0D"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.80066 7.12827C7.54133 7.38827 7.11733 7.38827 6.85799 7.12827L5.33133 5.60161V11.9929C5.33133 12.3596 5.03133 12.6596 4.66466 12.6596C4.29733 12.6596 3.99799 12.3596 3.99799 11.9929V5.60161L2.47066 7.12827C2.21133 7.38761 1.78733 7.38761 1.52799 7.12827C1.26866 6.86894 1.26866 6.44494 1.52799 6.18561L4.19333 3.52094C4.23199 3.48094 4.28133 3.45961 4.32666 3.43227C4.35466 3.41561 4.37733 3.39161 4.40799 3.37827C4.43533 3.36627 4.46599 3.36627 4.49466 3.35961C4.63599 3.32161 4.78533 3.32227 4.92133 3.37827C4.95066 3.39094 4.97266 3.41427 4.99999 3.43094C5.04666 3.45827 5.09533 3.48027 5.13599 3.52094L7.80066 6.18561C8.05999 6.44494 8.05999 6.86894 7.80066 7.12827Z"
                fill="#0D0D0D"
              />
            </svg>
            <span>Patch Transfer</span>
          </div>
        </Link>
        <Link
          href={`/account/info/?address=${address}`}
          className={cn(
            `rounded-lg px-4 py-[10px] flex items-center gap-4 cursor-pointer transition-all hover:pl-8`,
            {
              "bg-grey-300": pathname === "/account/info/",
            }
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <g clipPath="url(#clip0_443_1759)">
              <path
                d="M11.3155 4.93496V6.49381M11.3143 3.04353C11.2956 3.04353 11.2771 3.03982 11.2599 3.03263C11.2426 3.02544 11.2269 3.0149 11.2137 3.00162C11.2006 2.98834 11.1901 2.97258 11.1831 2.95525C11.176 2.93793 11.1725 2.91938 11.1726 2.90067C11.1726 2.82067 11.2366 2.75781 11.3143 2.75781M11.3166 3.04353C11.3543 3.04323 11.3904 3.02804 11.4169 3.00128C11.4435 2.97452 11.4583 2.93836 11.4583 2.90067C11.4585 2.88196 11.4549 2.86341 11.4479 2.84609C11.4408 2.82876 11.4304 2.813 11.4172 2.79972C11.4041 2.78644 11.3884 2.7759 11.3711 2.76871C11.3539 2.76151 11.3353 2.75781 11.3166 2.75781M0.979492 14.703H14.7018M2.27321 7.80581C2.27321 8.09682 2.33052 8.38498 2.44189 8.65384C2.55325 8.9227 2.71648 9.16699 2.92226 9.37276C3.12803 9.57854 3.37232 9.74177 3.64118 9.85313C3.91004 9.96449 4.1982 10.0218 4.48921 10.0218C4.78022 10.0218 5.06838 9.96449 5.33723 9.85313C5.60609 9.74177 5.85038 9.57854 6.05615 9.37276C6.26193 9.16699 6.42516 8.9227 6.53652 8.65384C6.64789 8.38498 6.70521 8.09682 6.70521 7.80581C6.70521 7.5148 6.64789 7.22664 6.53652 6.95779C6.42516 6.68893 6.26193 6.44464 6.05615 6.23886C5.85038 6.03309 5.60609 5.86986 5.33723 5.7585C5.06838 5.64713 4.78022 5.58981 4.48921 5.58981C4.1982 5.58981 3.91004 5.64713 3.64118 5.7585C3.37232 5.86986 3.12803 6.03309 2.92226 6.23886C2.71648 6.44464 2.55325 6.68893 2.44189 6.95779C2.33052 7.22664 2.27321 7.5148 2.27321 7.80581Z"
                stroke="black"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0.977539 14.7031V13.5329C0.977539 12.6016 1.34749 11.7084 2.00601 11.0499C2.66453 10.3914 3.55768 10.0214 4.48897 10.0214C5.42026 10.0214 6.3134 10.3914 6.97192 11.0499C7.63044 11.7084 8.0004 12.6016 8.0004 13.5329V14.7031M8.45068 7.67571C9.1148 8.32558 9.98166 8.72809 10.9067 8.81611C11.8317 8.90413 12.7589 8.67233 13.5337 8.15938C14.3084 7.64643 14.8839 6.88335 15.1641 5.99742C15.4443 5.11148 15.4122 4.15627 15.0733 3.2911C14.7344 2.42594 14.109 1.70314 13.3016 1.24327C12.4942 0.783403 11.5536 0.614271 10.6365 0.764088C9.71951 0.913904 8.88157 1.37361 8.2625 2.06652C7.64343 2.75944 7.28065 3.64367 7.23468 4.57171"
                stroke="black"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_443_1759">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>Account Info</span>
        </Link>
      </div>
    </div>
  );
};

export default LeftMenu;
