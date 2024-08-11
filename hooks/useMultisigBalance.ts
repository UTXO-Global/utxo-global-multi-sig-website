import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";

const useMultisigBalance = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const [balance, setBalance] = useState(ccc.Zero);

  const signer = ccc.useSigner();

  useEffect(() => {
    if (!signer) {
      setBalance(ccc.Zero);
      return;
    }

    (async () => {
      const mulAddress = await ccc.Address.fromString(
        account?.multi_sig_address!,
        signer.client
      );
      setBalance(await signer.client.getBalance([mulAddress.script]));
    })();
  }, [signer, account]);

  return {
    address: account?.multi_sig_address!,
    balance,
  };
};

export default useMultisigBalance;
