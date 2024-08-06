import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import api from "@/utils/api";
import { getBalanceMultiSigAccount } from "@/utils/helpers";

export const loadInfo = createAsyncThunk(
  "account-info/load-info",
  async (address: string, _) => {
    try {
      const { data: infoData } = await api.get(`/multi-sig/info/${address}`);
      const { data: signersData } = await api.get(
        `/multi-sig/signers/${address}`
      );
      const balance = await getBalanceMultiSigAccount(signersData.signers);
      return {
        ...infoData,
        signers_detail: signersData.signers,
        invites: signersData.invites,
        balance,
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
);

export const reset = createAction("account-info/reset");
