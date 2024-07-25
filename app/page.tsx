"use client";

import NewAccount from "@/components/NewAccount";

export default function Home() {
  return (
    <main className="bg-grey-300 pt-[48px] pb-[112px]">
      <div className="max-w-[858px] mx-auto">
        <NewAccount />
      </div>
    </main>
  );
}
