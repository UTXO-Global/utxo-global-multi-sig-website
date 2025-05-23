import { useCallback, useContext, useEffect, useState } from "react";

import api from "@/utils/api";
import { TransactionStatus, TransactionType } from "@/types/transaction";

import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { useAppSelector } from "@/redux/hook";
import { LIMIT_PER_PAGE } from "@/configs/common";
import { selectApp } from "@/redux/features/app/reducer";
import { AppContext } from "@/providers/app";

const useTransactions = (
  status: TransactionStatus[],
  autoLoad: boolean = true
) => {
  const [syncStatus, setSyncStatus] = useState(false);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const { config: appConfig } = useAppSelector(selectApp);

  const { info: account } = useAppSelector(selectAccountInfo);
  const { address } = useContext(AppContext);

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
              status: status.join(","),
            },
          }
        );
        setTransactions(data.transactions);
        setTotalRecords(data.pagination.total_records);
        setSyncStatus(false);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.multi_sig_address, page, status]
  );

  const updateTxCommited = async (txHashes: string[]) => {
    if (txHashes.length === 0) return;

    try {
      const { data } = await api.put(
        `/multi-sig/transactions/${address}/committed`,
        {
          tx_hashes: txHashes,
        }
      );

      const results = data.results || {};
      const newTxes: TransactionType[] = [];
      transactions.forEach((tx) => {
        if (!results[tx.transaction_id]) {
          newTxes.push(tx);
        }
      });

      setTransactions(newTxes);
      await load(false);
    } catch (e) {
      console.error(e);
    }
  };

  const isCommited = async (txHash: string) => {
    try {
      const res = await fetch(
        `${appConfig.apiURL}/ckb/${
          appConfig.network === "nervos" ? "mainnet" : "testnet"
        }/v1/transactions/0x${txHash}`
      );

      const data = await res.json();
      return data?.data?.attributes?.tx_status === "committed";
    } catch (e) {
      console.log(e);
    }
  };

  const updateCommited = async () => {
    const pendingTxes = transactions.filter(
      (tx) => tx.status === TransactionStatus.InProgressing
    );
    const dataUpdate: string[] = [];
    for (let i = 0; i < pendingTxes.length; i++) {
      const ok = await isCommited(pendingTxes[i].transaction_id);
      if (!!ok) {
        dataUpdate.push(pendingTxes[i].transaction_id);
      }
    }

    await updateTxCommited(dataUpdate);
    setSyncStatus(true);
  };

  useEffect(() => {
    if (autoLoad) {
      load(false);
    }
  }, [load, autoLoad]);

  useEffect(() => {
    if (!syncStatus && transactions && transactions.length > 0) {
      updateCommited();
    }
  }, [transactions, syncStatus]);

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
