import { useContext, useMemo } from "react";
import { AppContext } from "@/providers/app";
import { useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";
import { isAddressEqual } from "@/utils/helpers";

const useAuthenticate = () => {
  const { address } = useContext(AppContext);

  const { addressLogged, token } = useAppSelector(selectStorage);

  const isLoggedIn = useMemo(() => {
    return !!token && isAddressEqual(address, addressLogged);
  }, [address, addressLogged, token]);

  return { isLoggedIn };
};

export default useAuthenticate;
