import { useEffect, useState } from "react";

import api from "@/utils/api";
import { MultiSigAccountType } from "@/types/account";

const useListAccounts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<MultiSigAccountType[]>([]);

  const load = async () => {
    try {
      const { data } = await api.get(`/multi-sig/accounts`);
      setAccounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    isLoading,
    accounts,
    load,
  };
};

export default useListAccounts;
