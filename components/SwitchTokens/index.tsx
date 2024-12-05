/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { Popover } from "antd";

import cn from "@/utils/cn";

import IcnChevron from "@/public/icons/icn-chevron.svg";
import useAssets from "@/hooks/useAssets";
import TextAvatar from "../TextAvatar";
import { UdtBalanceType } from "@/redux/features/assets/type";
import { formatNumber } from "@/utils/helpers";

const SwitchToken = ({
  selToken,
  iconClassname,
  onChange,
}: {
  selToken?: UdtBalanceType & {
    typeHash: string;
  };
  iconClassname?: string;
  onChange: (
    token?: UdtBalanceType & {
      typeHash: string;
    }
  ) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { assets } = useAssets();

  const tokens = useMemo(() => {
    if (Object.values(assets.udtBalances).length > 0) {
      return Object.fromEntries(
        Object.entries(assets.udtBalances).filter(([_, udt]) => udt.balance > 0)
      );
    }
    return {};
  }, [assets]);

  const hide = () => {
    setOpen(false);
  };

  const balance = useMemo(() => {
    if (selToken) {
      return selToken.balance;
    }
    return Number(assets.balance) / 10 ** 8;
  }, [selToken, assets]);

  const symbol = useMemo(() => {
    if (selToken) {
      return selToken.symbol;
    }
    return "CKB";
  }, [selToken]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100">
      {/* CKB token */}
      <div
        className={cn(
          "px-4 py-[10px] flex gap-2 cursor-pointer transition-colors items-center",
          {
            "bg-grey-300 cursor-not-allowed": selToken === undefined,
          }
        )}
        onClick={() => {
          onChange();
          hide();
        }}
      >
        <img
          src="/images/nervos.png"
          alt="nervos"
          className="w-6 rounded-full"
        />
        <p>CKB</p>
      </div>

      {Object.entries(tokens).map(([typeHash, udtBalance]) => (
        <div
          key={`token-${typeHash}`}
          className={cn(
            "px-4 py-[10px] flex gap-2 cursor-pointer transition-colors items-center",
            {
              "bg-grey-300 cursor-not-allowed": selToken?.typeHash === typeHash,
            }
          )}
          onClick={() => {
            onChange({
              typeHash,
              ...udtBalance,
            });
            hide();
          }}
        >
          {udtBalance.icon ? (
            <img
              src={udtBalance.icon}
              alt="nervos"
              className="w-6 rounded-full"
            />
          ) : (
            <TextAvatar
              text={udtBalance.symbol}
              className="!w-6 !h-6 rounded-full"
            />
          )}

          <p>{udtBalance.symbol}</p>
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomRight"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      arrow={false}
    >
      <div className="flex gap-6 items-center cursor-pointer">
        <div className="flex gap-2 items-center">
          {selToken ? (
            <TextAvatar text={selToken.symbol} />
          ) : (
            <img
              src="/images/nervos.png"
              alt="nervos"
              className={cn(`w-6 h-6`, iconClassname)}
            />
          )}
          <div>
            <p className="text-[14px] leading-[24px] font-medium text-dark-100">
              {symbol}
            </p>
            <span className="text-[14px] leading-[18px]">
              {formatNumber(balance)} {symbol}
            </span>
          </div>
        </div>
        <IcnChevron className="w-4" />
      </div>
    </Popover>
  );
};

export default SwitchToken;
