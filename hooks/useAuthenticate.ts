import { useCallback, useEffect, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import { selectStorage } from "@/redux/features/storage/reducer";
import { useAppSelector } from "@/redux/hook";

import { isAddressEqual } from "@/utils/helpers";

const useAuthenticate = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const signer = ccc.useSigner();
  const { addressLogged, token } = useAppSelector(selectStorage);

  const _checkIsLoggedIn = useCallback(async () => {
    // if (!signer || !addressLogged) return false;
    if (!signer) return false;
    const address = await signer.getInternalAddress();
    if (!address) return false;
    setIsLoggedIn(true)
    // setIsLoggedIn(
    //   token && isAddressEqual(address, addressLogged) ? true : false
    // );
  }, [signer]);

  useEffect(() => {
    _checkIsLoggedIn();
  }, [_checkIsLoggedIn]);

  return { isLoggedIn };
};

export default useAuthenticate;
