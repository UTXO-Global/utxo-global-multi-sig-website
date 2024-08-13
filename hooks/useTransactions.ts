import { useCallback, useEffect, useState } from "react";

import api from "@/utils/api";
import { TransactionStatus, TransactionType } from "@/types/transaction";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppSelector } from "@/redux/hook";
import { LIMIT_PER_PAGE } from "@/configs/common";

const useTransactions = (status: TransactionStatus) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const { info: account } = useAppSelector(selectAccountInfo);

  const load = useCallback(
    async (isLoading: boolean) => {
      if (isLoading) setIsLoading(isLoading);
      try {
        const { data } = await api.get(
          `/multi-sig/transactions/${account?.multi_sig_address}`,
          {
            params: {
              limit: LIMIT_PER_PAGE,
              page,
              status,
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
    load(false);
  }, [load]);

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
