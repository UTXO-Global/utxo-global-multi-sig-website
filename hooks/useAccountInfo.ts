import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import useAuthenticate from "./useAuthenticate";
import { useAppDispatch } from "@/redux/hook";
import { loadInfo } from "@/redux/features/account-info/action";

const useAccountInfo = () => {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const dispatch = useAppDispatch();

  const { isLoggedIn } = useAuthenticate();

  useEffect(() => {
    if (!address || !isLoggedIn) return;
    dispatch(loadInfo(address as any));
  }, [address, dispatch, isLoggedIn]);
};

export default useAccountInfo;
