"use client";

import { useState } from "react";

import cn from "@/utils/cn";

import Transaction from "@/components/Transaction";
import IcnSpinner from "@/public/icons/icn-spinner.svg";
import IcnReload from "@/public/icons/icn-reload.svg";
import useTransactions from "@/hooks/useTransactions";
import { TransactionTab } from "@/types/transaction";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";

const Transactions = () => {
  const [tab, setTab] = useState<TransactionTab>(TransactionTab.Queue);
  const { isLoading, queue, history, loadTransactions } = useTransactions();
  const { info: account, isInfoLoading } = useAppSelector(selectAccountInfo);

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-between items-center">
        <div className="flex justify-start">
          {[TransactionTab.Queue, TransactionTab.History].map((z, i) => (
            <div
              key={i}
              className={cn(
                `px-6 pt-3 pb-4 border-b-2 border-transparent text-[16px] leading-[20px] font-medium text-grey-400 cursor-pointer capitalize`,
                {
                  "border-dark-100 font-bold text-dark-100": tab === z,
                }
              )}
              onClick={() => setTab(z)}
            >
              {z}
            </div>
          ))}
        </div>
        <div
          className={cn(
            `px-4 py-2 rounded-[6px] bg-grey-300 transition-colors hover:bg-grey-200 cursor-pointer`,
            {
              "cursor-not-allowed": isLoading,
            }
          )}
          onClick={() => {
            if (isLoading) return;
            loadTransactions(true);
          }}
        >
          <IcnReload
            className={cn(`w-[14px] stroke-dark-100`, {
              "animate-spin": isLoading,
            })}
          />
        </div>
      </div>
      <div className="py-4 px-6 grid gap-2">
        {isLoading || isInfoLoading ? (
          <div className="flex justify-center items-center py-10">
            <IcnSpinner className="w-10 animate-spin" />
          </div>
        ) : (
          <>
            {tab === TransactionTab.Queue ? (
              <>
                {queue.length === 0 ? (
                  <div className="py-10 flex justify-center text-[16px] leading-[20px] text-grey-500">
                    {`You don't have any transaction yet`}
                  </div>
                ) : (
                  queue.map((z, i) => (
                    <Transaction
                      key={`queue-${i}`}
                      transaction={z}
                      accountInfo={account as any}
                      refresh={() => loadTransactions(true)}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                {history.length === 0 ? (
                  <div className="py-10 flex justify-center text-[16px] leading-[20px] text-grey-500">
                    {`You don't have any transaction yet`}
                  </div>
                ) : (
                  history.map((z, i) => (
                    <Transaction
                      key={`history-${i}`}
                      transaction={z}
                      accountInfo={account as any}
                    />
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Transactions;
