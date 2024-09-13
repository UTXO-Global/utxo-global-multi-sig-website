import Link from "next/link";

import IcnWaterTap from "@/public/icons/icn-water-tap.svg";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";
import { CkbNetwork } from "@/types/common";

const Faucet = () => {
  const { config } = useAppSelector(selectApp);
  if (config.network === CkbNetwork.MiranaMainnet) return null;

  return (
    <Link
      href="https://faucet.nervos.org/"
      target="_blank"
      className="w-8 aspect-square rounded-[4px] transition-colors hover:bg-grey-200 bg-grey-300 flex justify-center items-center cursor-pointer"
    >
      <IcnWaterTap className="w-4" />
    </Link>
  );
};

export default Faucet;
