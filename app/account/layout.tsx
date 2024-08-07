"use client";

import { Suspense } from "react";

import LeftMenu from "@/components/LeftMenu";
import useAccountInfo from "@/hooks/useAccountInfo";

const _AccountLayout = ({ children }: { children: React.ReactNode }) => {
  useAccountInfo();

  return (
    <>
      <div className="flex h-[calc(100vh-69.71px-61px)] overflow-y-auto bg-grey-300">
        <LeftMenu />
        <div className="bg-grey-300 flex-1">{children}</div>
      </div>
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
