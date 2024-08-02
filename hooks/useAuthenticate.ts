import { useCallback, useEffect, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import { selectStorage } from "@/redux/features/storage/reducer";
import { useAppSelector } from "@/redux/hook";

import { isAddressEqual } from "@/utils/helpers";

const useAuthenticate = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const signer = ccc.useSigner();
  const { addressLogged, token } = useAppSelector(selectStorage);

  // const _checkIsLoggedIn = useCallback(async () => {
  //   if (!signer || !addressLogged) return setIsLoggedIn(false);
  //   const address = await signer.getInternalAddress();
  //   if (!address) return setIsLoggedIn(false);
  //   setIsLoggedIn(
  //     token && isAddressEqual(address, addressLogged) ? true : false
  //   );
  // }, [addressLogged, signer, token]);

  // useEffect(() => {
  //   _checkIsLoggedIn();
  // }, [_checkIsLoggedIn]);

  const isLoggedIn = useMemo(() => {
    if (!signer) return false;
    return !!token;
  },[signer, token]);

  return { isLoggedIn };
};

export default useAuthenticate;
