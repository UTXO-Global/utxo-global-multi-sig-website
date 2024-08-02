"use client";

import cn from "@/utils/cn";

import Transaction from "@/components/Transaction";
import { useState } from "react";

const Transactions = () => {
  const [tab, setTab] = useState<string>("queue");

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-start">
        <div
          className={cn(
            `px-6 pt-3 pb-4 border-b-2 border-transparent text-[16px] leading-[20px] font-medium text-grey-400 cursor-pointer`,
            {
              "border-dark-100 font-bold text-dark-100": tab === "queue",
            }
          )}
          onClick={() => setTab("queue")}
        >
          Queue
        </div>
        <div
          className={cn(
            `px-6 pt-3 pb-4 border-b-2 border-transparent text-[16px] leading-[20px] font-medium text-grey-400 cursor-pointer`,
            {
              "border-dark-100 font-bold text-dark-100": tab === "history",
            }
          )}
          onClick={() => setTab("history")}
        >
          History
        </div>
      </div>
      <div className="py-4 px-6 grid gap-2">
        <p className="text-[16px] leading-[20px] font-medium text-grey-400">
          Next
        </p>
        {tab === "queue" ? (
          <>
            <Transaction status="pending" isConfirm={true} />
            <Transaction status="pending" />
          </>
        ) : (
          <>
            <Transaction status="pending" />
            <Transaction status="success" />
            <Transaction status="unsuccess" />
          </>
        )}
      </div>
    </main>
  );
};

export default Transactions;
