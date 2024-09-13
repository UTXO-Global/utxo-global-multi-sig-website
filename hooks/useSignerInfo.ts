import { ccc } from "@ckb-ccc/connector-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/app";
import { getBalance } from "@/utils/helpers";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";

const useSignerInfo = () => {
  const { address } = useContext(AppContext);
  const [balance, setBalance] = useState(0);
  const { config } = useAppSelector(selectApp);

  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }

    (async () => {
      setBalance(await getBalance(address, config));
    })();
  }, [address]);

  return {
    address,
    balance,
  };
};

export default useSignerInfo;
