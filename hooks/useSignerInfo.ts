import { ccc } from "@ckb-ccc/connector-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/app";

const useSignerInfo = () => {
  const { address } = useContext(AppContext);
  const [balance, setBalance] = useState(ccc.Zero);

  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      setBalance(ccc.Zero);
      return;
    }

    (async () => {
      setBalance(await signer.getBalance());
    })();
  }, [signer]);

  return {
    address,
    balance,
  };
};

export default useSignerInfo;
