"use client";
import { useContext, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import useAuthenticate from "@/hooks/useAuthenticate";
import useLogin from "@/hooks/useLogin";
import useLoadAddressBooks from "@/hooks/useLoadAddressBooks";
import useCkbPrice from "@/hooks/useCkbPrice";

import ConnectedRequired from "@/components/ConnectedRequired";

import { AppContext } from "@/providers/app";
import { isAddressEqual } from "@/utils/helpers";
import { selectStorage } from "@/redux/features/storage/reducer";
import { reset } from "@/redux/features/storage/action";

const _MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { address } = useContext(AppContext);

  const { addressLogged } = useAppSelector(selectStorage);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!address) return;
    if (isAddressEqual(address, addressLogged)) return;
    dispatch(reset());
  }, [address, addressLogged, dispatch]);

  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuthenticate();

  useLogin();
  useLoadAddressBooks();
  useCkbPrice();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(reset());
    }
  }, [dispatch, isLoggedIn]);

  if (!isLoggedIn) return <ConnectedRequired />;
  return <_MainLayout>{children}</_MainLayout>;
};

export default MainLayout;
