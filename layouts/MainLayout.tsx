"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/redux/hook";
import useAuthenticate from "@/hooks/useAuthenticate";
import useLogin from "@/hooks/useLogin";
import useLoadAddressBooks from "@/hooks/useLoadAddressBooks";
import useCkbPrice from "@/hooks/useCkbPrice";

import { reset } from "@/redux/features/storage/action";
import ConnectedRequired from "@/components/ConnectedRequired";

const _MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { isLoggedIn } = useAuthenticate();

  useLogin();
  useLoadAddressBooks();
  useCkbPrice();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      dispatch(reset());
    }
  }, [dispatch, isLoggedIn]);

  if (!isLoggedIn) return <ConnectedRequired />;
  return <_MainLayout>{children}</_MainLayout>;
};

export default MainLayout;
