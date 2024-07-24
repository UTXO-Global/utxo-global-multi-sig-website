/* eslint-disable @next/next/no-img-element */
import cn from "@/utils/cn";

import IcnChevron from "@/public/icons/icn-chevron.svg";

const SwitchNetwork = ({ iconClassname }: { iconClassname?: string }) => {
  return (
    <div className="flex gap-6 items-center cursor-pointer">
      <div className="flex gap-2 items-center">
        <img
          src="/images/nervos.png"
          alt="nervos"
          className={cn(`w-6 h-6`, iconClassname)}
        />
        <p className="text-[14px] leading-[24px] font-medium text-dark-100">
          Pudge Testnet
        </p>
      </div>
      <IcnChevron className="w-4" />
    </div>
  );
};

export default SwitchNetwork;
