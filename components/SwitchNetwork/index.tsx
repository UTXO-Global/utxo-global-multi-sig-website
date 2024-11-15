/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Popover } from "antd";

import cn from "@/utils/cn";
import { CkbNetwork } from "@/types/common";

import IcnChevron from "@/public/icons/icn-chevron.svg";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { reset, setNetwork } from "@/redux/features/storage/action";
import { NETWORK_NAME } from "@/configs/network";
import { setNetworkConfig } from "@/redux/features/app/action";
import { selectApp } from "@/redux/features/app/reducer";
import { reset as restAccountInfo } from "@/redux/features/account-info/action";
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from "next/navigation";

const NETWORK = [
  {
    icon: "/images/nervos.png",
    name: "Mirana Mainnet",
    network: CkbNetwork.MiranaMainnet,
  },
  {
    icon: "/images/nervos.png",
    name: "Meepo Testnet",
    network: CkbNetwork.MeepoTestnet,
    isTestnet: true,
  },
];
const SwitchNetwork = ({
  iconClassname,
  customEl,
}: {
  iconClassname?: string;
  customEl?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { config } = useAppSelector(selectApp);
  const { disconnect } = ccc.useCcc();
  const router = useRouter();

  const hide = () => {
    setOpen(false);
  };

  const changeNetwork = (network: CkbNetwork) => {
    disconnect();
    dispatch(setNetwork(network));
    dispatch(setNetworkConfig(network));
    dispatch(reset());
    dispatch(restAccountInfo());
    router.push("/");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100">
      {NETWORK.map((n) => (
        <div
          key={`network-${n.network}`}
          className={cn(
            "px-4 py-[10px] flex gap-2 cursor-pointer transition-colors items-center",
            {
              "bg-grey-300 cursor-not-allowed": config.network === n.network,
            }
          )}
          onClick={() => {
            if (n.network !== config.network) {
              changeNetwork(n.network);
              hide();
            }
          }}
        >
          <img src={n.icon} alt="nervos" className="w-6 rounded-full" />
          <p>{n.name}</p>
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
          <img
            src="/images/nervos.png"
            alt="nervos"
            className={cn(`w-6 h-6`, iconClassname)}
          />
          <div>
            <p className="text-[14px] leading-[24px] font-medium text-dark-100">
              {NETWORK_NAME[config.network]}
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
