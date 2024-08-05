"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import LeftMenu from "@/components/LeftMenu";
import ConnectedRequired from "@/components/ConnectedRequired";
import useAuthenticate from "@/hooks/useAuthenticate";

import { useAppDispatch } from "@/redux/hook";
import { loadInfo } from "@/redux/features/account-info/action";

const _AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const { isLoggedIn } = useAuthenticate();

  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (isLoggedIn) return;
  //   router.push("/");
  // }, [isLoggedIn]);

  useEffect(() => {
    if (!address) return;
    dispatch(loadInfo(address as any));
    // dispatch(loadInvites())
  }, [address]);

  return (
    <>
      {isLoggedIn ? (
        <div className="flex h-[calc(100vh-69.71px-61px)] overflow-y-auto bg-grey-300">
          <LeftMenu />
          <div className="bg-grey-300 flex-1">{children}</div>
        </div>
      ) : (
        <div className="px-6 py-4 h-[calc(100vh-69.71px-61px)] flex items-center justify-center">
          <ConnectedRequired />
        </div>
      )}
    </>
  );
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <_AccountLayout>{children}</_AccountLayout>
    </Suspense>
  );
}
