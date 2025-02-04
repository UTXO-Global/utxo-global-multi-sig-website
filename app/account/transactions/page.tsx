"use client";

import { useEffect, useState } from "react";
import { Pagination } from "antd";

import cn from "@/utils/cn";

import Transaction from "@/components/Transaction";
import IcnReload from "@/public/icons/icn-reload.svg";
import useTransactions from "@/hooks/useTransactions";
import { TransactionStatus, TransactionTab } from "@/types/transaction";
import { useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { LIMIT_PER_PAGE } from "@/configs/common";

const Skeleton = () => {
  return (
    <div className="h-[60px] rounded-lg bg-light-100 px-4 flex items-center">
      <div className="w-[45%] pr-10 flex justify-between">
        <div className="rounded-lg bg-grey-300 animate-pulse w-[60px] h-[20px]"></div>
        <div className="rounded-lg bg-grey-300 animate-pulse w-[80px] h-[20px]"></div>
      </div>
      <div className="w-[15%] grid grid-cols-2 gap-4 pl-2">
        <div className="rounded-lg bg-grey-300 animate-pulse w-[80px] h-[20px]"></div>
      </div>
      <div className="w-[40%] flex justify-between pl-4">
        <div className="rounded-lg bg-grey-300 animate-pulse w-[100px] h-[20px]"></div>
        <div className="rounded-lg bg-grey-300 animate-pulse w-[80px] h-[20px]"></div>
      </div>
    </div>
  );
};

const TransactionHistory = ({ status }: { status: TransactionStatus[] }) => {
  const { isLoading, setPage, page, transactions, totalRecords, load } =
    useTransactions(status);

  const { info: account, isInfoLoading } = useAppSelector(selectAccountInfo);

  const refresh = () => {
    if (page === 1) load(true);
    else {
      setPage(1);
    }
  };
  return (
    <div className="py-4 px-6 relative">
      <div className="absolute right-6 top-0 -translate-y-10 flex gap-4">
        <Pagination
          disabled={isLoading || isInfoLoading}
          responsive={true}
          current={page}
          defaultCurrent={page}
          total={totalRecords}
          showSizeChanger={false}
          onChange={(val) => setPage(val)}
          defaultPageSize={LIMIT_PER_PAGE}
        />
        <div
          className={cn(
            `px-4 py-2 rounded-[6px] bg-grey-300 transition-colors hover:bg-grey-200 cursor-pointer inline-flex`,
            {
              "cursor-not-allowed": isLoading,
            }
          )}
          onClick={() => {
            if (isLoading) return;
            refresh();
          }}
        >
          <IcnReload
            className={cn(`w-[14px] stroke-dark-100`, {
              "animate-spin": isLoading,
            })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        {isLoading || isInfoLoading ? (
          <>
            {Array(4)
              .fill(0)
              .map((z, i) => (
                <Skeleton key={i} />
              ))}
          </>
        ) : (
          <>
            {transactions.length === 0 ? (
              <div className="py-10 flex justify-center text-[16px] leading-[20px] text-grey-500">
                {`You don't have any transaction yet`}
              </div>
            ) : (
              transactions.map((z, i) => (
                <Transaction
                  key={z.transaction_id}
                  transaction={z}
                  accountInfo={account as any}
                  refresh={() => {
                    refresh();
                  }}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Transactions = () => {
  const [tab, setTab] = useState<TransactionTab>(TransactionTab.Queue);

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-between items-center">
        <div className="flex justify-start">
          {[
            TransactionTab.Queue,
            TransactionTab.InProgressing,
            TransactionTab.History,
          ].map((z, i) => (
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
      </div>
      {tab === TransactionTab.Queue && (
        <TransactionHistory status={[TransactionStatus.WaitingSigned]} />
      )}

      {tab === TransactionTab.InProgressing && (
        <TransactionHistory status={[TransactionStatus.InProgressing]} />
      )}

      {tab === TransactionTab.History && (
        <TransactionHistory
          status={[
            TransactionStatus.Commited,
            TransactionStatus.Rejected,
            TransactionStatus.Failed,
          ]}
        />
      )}
    </main>
  );
};

export default Transactions;
