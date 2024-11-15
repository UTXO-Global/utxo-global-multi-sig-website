import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";

import { loadCkbAddressInfo } from "@/redux/features/assets/action";
import { selectAssets } from "@/redux/features/assets/reducer";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";

const useAssets = () => {
  const dispatch = useAppDispatch();
  const { info: account } = useAppSelector(selectAccountInfo);

  useEffect(() => {
    if (account?.multi_sig_address) {
      dispatch(loadCkbAddressInfo(account?.multi_sig_address));
    }
  }, [dispatch, account]);

  return useAppSelector(selectAssets);
};

export default useAssets;
