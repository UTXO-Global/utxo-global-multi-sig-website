import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";

const useSignerInfo = () => {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState(ccc.Zero);

  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance(ccc.Zero);
      return;
    }

    (async () => {
      setAddress(await signer.getRecommendedAddress());
      setBalance(await signer.getBalance());
    })();
  }, [signer]);

  return {
    address,
    balance,
  };
};

export default useSignerInfo;
