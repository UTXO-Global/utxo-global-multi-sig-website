import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

import api from "@/utils/api";

export const load = createAsyncThunk("address-book/load", async () => {
  try {
    const { data } = await api.get(`/address-books/`);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
});

export const reset = createAction("address-book/reset");
