"use client";

import ListAccounts from "@/components/ListAccounts";
import NewAccount from "@/components/NewAccount";
import { useState } from "react";

export default function Home() {
  const [isShowNewAccount, setIsShowNewAccount] = useState<boolean>(false);
  return (
    <main className="bg-grey-300 pt-[48px] pb-[112px]">
      {isShowNewAccount ? (
        <div className="max-w-[858px] mx-auto">
          <NewAccount onCancel={() => setIsShowNewAccount(false)} />
        </div>
      ) : (
        <div className="max-w-[700px] mx-auto">
          <ListAccounts onCreateAccount={() => setIsShowNewAccount(true)} />
        </div>
      )}
    </main>
  );
}
