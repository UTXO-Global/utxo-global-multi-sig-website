import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
const useCells = () => {
  const [loading, setLoading] = useState(false);
  const [usableCells, setUsableCells] = useState<{ [key: string]: number }>({});
  const { config } = useAppSelector(selectApp);
  const { info: account } = useAppSelector(selectAccountInfo);

  const getPendingCells = async () => {
    setLoading(true);
    try {
      const apiURL = `${config.apiURL}/ckb/${
        config.network === "nervos" ? "mainnet" : "testnet"
      }/v1/address_pending_transactions/${account?.multi_sig_address}`;
      const res = await fetch(apiURL);
      const { data } = await res.json();
      const cells = (data as any[]).reduce<{ [key: string]: number }>(
        (acc, transaction) => {
          const inputs =
            (transaction.attributes?.display_inputs as any[]) || [];
          inputs.forEach(
            (input) => (acc[input.generated_tx_hash] = Number(input.cell_index))
          );
          return acc;
        },
        {}
      );
      setUsableCells(cells);
    } catch (e: any) {
      console.log("Get pending transaction failed: ", e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPendingCells();
  }, [account, config]);

  return { usableCells, loading };
};

export default useCells;
