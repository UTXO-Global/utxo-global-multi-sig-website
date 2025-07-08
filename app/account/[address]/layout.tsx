/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense } from "react";
import Link from "next/link";

import Button from "@/components/Common/Button";
import LeftMenu from "@/components/LeftMenu";
import useAccountInfo from "@/hooks/useAccountInfo";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  useAccountInfo();
  const { info: account, isInfoLoading } = useAppSelector(selectAccountInfo);

  if (!isInfoLoading && !account)
    return (
      <div className="h-[calc(100vh-69.71px-61px)] bg-light-100">
        <img
          src="/images/404.png"
          alt="404"
          className="max-w-[700px] mx-auto mt-10"
        />
        <h5 className="text-[46px] font-bold text-center mt-[10px] mb-10">
          Oops! Not found
        </h5>
        <div className="flex justify-center">
          <Link href="/">
            <Button className="!px-[74px]">Back to home</Button>
          </Link>
        </div>
      </div>
    );
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
      <Layout>{children}</Layout>
    </Suspense>
  );
}
