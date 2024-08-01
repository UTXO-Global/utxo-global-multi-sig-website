"use client";
import { useState } from "react";

import ConnectedRequired from "@/components/ConnectedRequired";
import ListAccounts from "@/components/ListAccounts";
import NewAccount from "@/components/NewAccount";

import useAuthenticate from "@/hooks/useAuthenticate";

export default function Home() {
  const [isShowNewAccount, setIsShowNewAccount] = useState<boolean>(false);

  const { isLoggedIn } = useAuthenticate();

  return (
    <main className="bg-grey-300">
      {isLoggedIn ? (
        <div className="bg-grey-300 pt-[48px] pb-[112px]">
          {isShowNewAccount ? (
            <div className="max-w-[858px] mx-auto">
              <NewAccount onCancel={() => setIsShowNewAccount(false)} />
            </div>
          ) : (
            <div className="max-w-[700px] mx-auto">
              <ListAccounts onCreateAccount={() => setIsShowNewAccount(true)} />
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 py-4 h-[calc(100vh-69.71px-61px)] flex items-center justify-center">
          <ConnectedRequired />
        </div>
      )}
    </main>
  );
}
