"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import LeftMenu from "@/components/LeftMenu";
import useAuthenticate from "@/hooks/useAuthenticate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticate();

  useEffect(() => {
    if (isLoggedIn) return;
    router.push("/");
  }, [isLoggedIn]);
  
  return (
    <>
      <div className="flex h-[calc(100vh-69.71px-61px)] overflow-y-auto bg-grey-300">
        <LeftMenu />
        <div className="bg-grey-300 flex-1">{children}</div>
      </div>
    </>
  );
}
