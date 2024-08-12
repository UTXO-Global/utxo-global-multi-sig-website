import api from "@/utils/api";
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

export const load = createAsyncThunk(
  "transactions/load",
  async (address: string) => {
    try {
      const { data } = await api.get(`/multi-sig/transactions/${address}`);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
);

export const reset = createAction("transactions/reset");
