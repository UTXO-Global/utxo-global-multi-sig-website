/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Popover } from "antd";

import cn from "@/utils/cn";
import { CkbNetwork } from "@/types/common";

import IcnChevron from "@/public/icons/icn-chevron.svg";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";
import { setNetwork } from "@/redux/features/storage/action";

const NETWORK_NAME = {
  nervos_testnet: "Pudge Testnet",
  nervos: "Mirana Mainnet",
};

const SwitchNetwork = ({
  iconClassname,
  customEl,
}: {
  iconClassname?: string;
  customEl?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { network } = useAppSelector(selectStorage);

  const hide = () => {
    setOpen(false);
  };

  const changeNetwork = (network: CkbNetwork) => {
    dispatch(setNetwork(network));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100">
      <div
        className="px-4 py-[10px] flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer"
        onClick={() => {
          changeNetwork(CkbNetwork.MiranaMainnet);
          hide();
        }}
      >
        <img
          src="/images/nervos.png"
          alt="nervos"
          className="w-6 rounded-full"
        />
        <p>Mirana Mainnet</p>
      </div>
      <div
        className="px-4 py-[10px] flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer"
        onClick={() => {
          changeNetwork(CkbNetwork.PudgeTestnet);
          hide();
        }}
      >
        <img
          src="/images/nervos.png"
          alt="nervos"
          className="w-6 rounded-full"
        />
        <p>Pudge Testnet</p>
      </div>
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
          <img
            src="/images/nervos.png"
            alt="nervos"
            className={cn(`w-6 h-6`, iconClassname)}
          />
          <div>
            <p className="text-[14px] leading-[24px] font-medium text-dark-100">
              {NETWORK_NAME[network]}
            </p>
            {customEl}
          </div>
        </div>
        <IcnChevron className="w-4" />
      </div>
    </Popover>
  );
};

export default SwitchNetwork;
