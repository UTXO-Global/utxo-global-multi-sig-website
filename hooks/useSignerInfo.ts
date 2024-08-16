import { ccc } from "@ckb-ccc/connector-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/app";
import { getBalance } from "@/utils/helpers";

const useSignerInfo = () => {
  const { address } = useContext(AppContext);
  const [balance, setBalance] = useState(0);

  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      setBalance(0);
      return;
    }

    (async () => {
      setBalance(await getBalance(address));
    })();
  }, [address, signer]);

  return {
    address,
    balance,
  };
};

export default useSignerInfo;
