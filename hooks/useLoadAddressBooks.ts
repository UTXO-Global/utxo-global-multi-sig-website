import { useEffect } from "react";

import { useAppDispatch } from "@/redux/hook";
import useAuthenticate from "./useAuthenticate";

import { load, reset } from "@/redux/features/address-book/action";

const useLoadAddressBooks = () => {
  const { isLoggedIn } = useAuthenticate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoggedIn) dispatch(reset());
    else dispatch(load());
  }, [dispatch, isLoggedIn]);
};

export default useLoadAddressBooks;
