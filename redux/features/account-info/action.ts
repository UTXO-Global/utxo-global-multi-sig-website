import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import api from "@/utils/api";
import { getBalance } from "@/utils/helpers";
import { INetworkConfig } from "@/configs/network";

export const loadInfo = createAsyncThunk(
  "account-info/load-info",
  async (
    {
      address,
      networkConfig,
    }: { address: string; networkConfig: INetworkConfig },
    _
  ) => {
    try {
      const { data: infoData } = await api.get(`/multi-sig/info/${address}`);
      const { data: signersData } = await api.get(
        `/multi-sig/signers/${address}`
      );
      const { data: summary } = await api.get(
        `/multi-sig/transactions/${address}/summary`
      );
      const balance = await getBalance(
        infoData.multi_sig_address,
        networkConfig
      );
      return {
        ...infoData,
        signers_detail: signersData.signers,
        invites: signersData.invites,
        balance,
        totalTxPending: summary.total_tx_pending,
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
);

export const loadTransactionSummary = createAsyncThunk(
  "account-info/load-transaction-summary",
  async ({ address }: { address: string }, _) => {
    try {
      const { data: summary } = await api.get(
        `/multi-sig/transactions/${address}/summary`
      );

      return {
        totalTxPending: summary.total_tx_pending,
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
);

export const updateAccountName = createAction<string>(
  "account-info/update-account-name"
);

export const reset = createAction("account-info/reset");
