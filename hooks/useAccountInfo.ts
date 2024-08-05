import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { MultiSigAccountType } from "@/types/account";
import api from "@/utils/api";

const useAccountInfo = () => {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<MultiSigAccountType | undefined>(
    undefined
  );

  const load = useCallback(async () => {
    if (!address) return;
    try {
      const { data: infoData } = await api.get(`/multi-sig/info/${address}`);
      const { data: signersData } = await api.get(
        `/multi-sig/signers/${address}`
      );
      setAccount({
        ...infoData,
        signers_detail: signersData,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  return { isLoading, account };
};

export default useAccountInfo;
