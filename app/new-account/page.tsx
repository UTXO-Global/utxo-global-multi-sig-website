"use client";
import { useState } from "react";

import ConnectedRequired from "@/components/ConnectedRequired";
import ListAccounts from "@/components/ListAccounts";
import NewAccount from "@/components/NewAccount";

import useAuthenticate from "@/hooks/useAuthenticate";

export default function NewAccountPage() {
  const { isLoggedIn } = useAuthenticate();

  return (
    <main className="bg-grey-300">
      {isLoggedIn ? (
        <div className="bg-grey-300 pt-[48px] pb-[112px]">
          <div className="max-w-[858px] mx-auto">
            <NewAccount />
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 h-[calc(100vh-69.71px-61px)] flex items-center justify-center">
          <ConnectedRequired />
        </div>
      )}
    </main>
  );
}
