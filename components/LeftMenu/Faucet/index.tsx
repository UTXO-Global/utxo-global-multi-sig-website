import Link from "next/link";

import { NETWORK } from "@/configs/common";
import IcnWaterTap from "@/public/icons/icn-water-tap.svg";

const Faucet = () => {

  if (NETWORK === "nervos") return null;

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
