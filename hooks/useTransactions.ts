import { useCallback, useEffect, useMemo, useState } from "react";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { load } from "@/redux/features/transactions/action";
import { selectTransactions } from "@/redux/features/transactions/reducer";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { TransactionStatus } from "@/types/transaction";

const useTransactions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { info: account } = useAppSelector(selectAccountInfo);
  const { data } = useAppSelector(selectTransactions);

  const dispatch = useAppDispatch();

  const queue = useMemo(() => {
    return data.filter((z) => z.status === TransactionStatus.WaitingSigned);
  }, [data]);

  const history = useMemo(() => {
    return data.filter((z) => z.status === TransactionStatus.Sent);
  }, [data]);

  const loadTransactions = useCallback(
    async (isLoading: boolean) => {
      if (!account) return;
      setIsLoading(isLoading);
      await dispatch(load(account?.multi_sig_address));
      setIsLoading(false);
    },
    [account, dispatch]
  );

  useEffect(() => {
    loadTransactions(true);
  }, [loadTransactions]);

  return {
    queue,
    history,
    isLoading,
    loadTransactions,
  };
};

export default useTransactions;
