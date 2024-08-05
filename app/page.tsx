"use client";

import ConnectedRequired from "@/components/ConnectedRequired";
import ListAccounts from "@/components/ListAccounts";

import useAuthenticate from "@/hooks/useAuthenticate";

export default function Home() {
  const { isLoggedIn } = useAuthenticate();

  return (
    <main className="bg-grey-300 min-h-[calc(100vh-69.71px-61px)]">
      {isLoggedIn ? (
        <div className="bg-grey-300 pt-[48px] pb-[112px]">
          <div className="max-w-[700px] mx-auto">
            <ListAccounts />
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
