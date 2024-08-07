"use client";

import ListAccounts from "@/components/ListAccounts";

export default function Home() {
  return (
    <main className="bg-grey-300 min-h-[calc(100vh-69.71px-61px)]">
      <div className="bg-grey-300 pt-[48px] pb-[112px]">
        <div className="max-w-[700px] mx-auto">
          <ListAccounts />
        </div>
      </div>
    </main>
  );
}
