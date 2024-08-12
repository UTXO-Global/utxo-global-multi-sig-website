import { useEffect, useMemo } from "react";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { load } from "@/redux/features/transactions/action";
import { selectTransactions } from "@/redux/features/transactions/reducer";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { TransactionStatus } from "@/types/transaction";

const useTransactions = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const { data, isLoading } = useAppSelector(selectTransactions);
  const dispatch = useAppDispatch();

  const queue = useMemo(() => {
    return data.filter((z) => z.status === TransactionStatus.WaitingSigned);
  }, [data]);

  const history = useMemo(() => {
    return data.filter((z) => z.status === TransactionStatus.Sent);
  }, [data]);

  useEffect(() => {
    if (!account) return;
    dispatch(load(account.multi_sig_address));
  }, [account, dispatch]);

  return {
    queue,
    history,
    isLoading,
  };
};

export default useTransactions;
