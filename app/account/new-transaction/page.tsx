/* eslint-disable @next/next/no-img-element */
"use client";

import NewTx from "@/components/NewTx";

const NewTransaction = () => {
  return (
    <main className="h-full overflow-y-auto">
      <div className="py-6 max-w-[633px] mx-auto bg-light-100 mt-[76px] rounded-lg overflow-hidden relative">
        <NewTx />
      </div>
    </main>
  );
};

export default NewTransaction;
