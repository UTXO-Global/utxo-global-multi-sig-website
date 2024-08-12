import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import { load, reset } from "./action";
import { defaultTransactionsReducer } from "./type";

const transactionsReducer = createReducer(
  defaultTransactionsReducer,
  (builder) => {
    builder
      // load transactions
      .addCase(load.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(load.fulfilled, (state, action) => {
        if (action.payload) {
          state.data = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(load.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(reset, (state) => {
        state.data = [];
      });
  }
);

export const selectTransactions = (state: RootState) => state.transactions;

export default transactionsReducer;
