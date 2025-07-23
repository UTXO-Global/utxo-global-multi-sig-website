import { useCallback, useContext, useEffect, useState } from "react";

import api from "@/utils/api";
import { TransactionStatus, TransactionType } from "@/types/transaction";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { LIMIT_PER_PAGE } from "@/configs/common";
import { selectApp } from "@/redux/features/app/reducer";
import { AppContext } from "@/providers/app";
import { loadTransactionSummary } from "@/redux/features/account-info/action";

const useTransactions = (
  status: TransactionStatus[],
  autoLoad: boolean = true,
  isRefeshSummary: boolean = false
) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const { config: appConfig } = useAppSelector(selectApp);

  const { info: account } = useAppSelector(selectAccountInfo);
  const dispatch = useAppDispatch();

  const load = useCallback(
    async (isLoading: boolean) => {
      if (!account?.multi_sig_address) return;

      if (isLoading) setIsLoading(isLoading);
      try {
        const { data } = await api.get(
          `/multi-sig/transactions/${account?.multi_sig_address}`,
          {
            params: {
              limit: LIMIT_PER_PAGE,
              page,
              status: status.join(","),
            },
          }
        );
        setTransactions(data.transactions);
        setTotalRecords(data.pagination.total_records);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.multi_sig_address, page, status]
  );

  useEffect(() => {
    if (autoLoad) {
      load(false);
    }
  }, [load, autoLoad]);

  useEffect(() => {
    if (account?.multi_sig_address && isRefeshSummary) {
      // Load transaction summary
      dispatch(loadTransactionSummary({ address: account.multi_sig_address }));
    }
  }, [transactions, account?.multi_sig_address, isRefeshSummary]);

  return {
    page,
    totalRecords,
    transactions,
    setPage,
    isLoading,
    load,
  };
};

export default useTransactions;
