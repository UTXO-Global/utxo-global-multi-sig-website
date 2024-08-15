import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { NETWORK } from "@/configs/common";

import IcnWaterTap from "@/public/icons/icn-water-tap.svg"

const Faucet = ({ address }: { address: string | undefined }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const faucetCkb = useCallback(() => {
    if (!address) return;
    setIsLoading(true);
    fetch("https://faucet-api.nervos.org/claim_events", {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        claim_event: {
          address_hash: address,
          amount: "100000",
        },
      }),
      method: "POST",
    })
      .then((response) => {
        if (response.status === 200) {
          response
            .json()
            .then((_) => {
              toast.success("Faucet success");
            })
            .catch((e) => {});
        } else if (response.status === 422) {
          toast.error("Amount is already reached maximum limit.");
        } else {
          toast.error("Cannot faucet. Please try again");
        }
      })
      .catch((e) => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [address]);

  if (NETWORK === "nervos") return null

  return (
    <div
      className="w-8 aspect-square rounded-[4px] transition-colors hover:bg-grey-200 bg-grey-300 flex justify-center items-center cursor-pointer"
      onClick={faucetCkb}
    >
      <IcnWaterTap className="w-4" />
    </div>
  );
};

export default Faucet;
