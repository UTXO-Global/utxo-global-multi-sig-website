import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import useAuthenticate from "./useAuthenticate";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadInfo } from "@/redux/features/account-info/action";
import { selectApp } from "@/redux/features/app/reducer";

const useAccountInfo = () => {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const { config } = useAppSelector(selectApp);
  const dispatch = useAppDispatch();

  const { isLoggedIn } = useAuthenticate();

  useEffect(() => {
    if (!address || !isLoggedIn) return;
    dispatch(loadInfo({ address: address!, networkConfig: config }));
  }, [address, dispatch, isLoggedIn]);
};

export default useAccountInfo;
