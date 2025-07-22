import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import {
  loadInfo,
  loadTransactionSummary,
  reset,
  updateAccountName,
} from "./action";
import { defaultAccountInfoReducer } from "./type";

const accountInfoReducer = createReducer(
  defaultAccountInfoReducer,
  (builder) => {
    builder
      // load info
      .addCase(loadInfo.pending, (state) => {
        state.isInfoLoading = true;
      })
      .addCase(loadInfo.fulfilled, (state, action) => {
        if (action.payload) {
          state.info = action.payload;
        }
        state.isInfoLoading = false;
      })
      .addCase(loadInfo.rejected, (state) => {
        state.isInfoLoading = false;
      })
      .addCase(loadTransactionSummary.fulfilled, (state, action) => {
        if (action.payload) {
          state.info = {
            ...state.info,
            ...action.payload,
          } as any;
        }
      })

      .addCase(updateAccountName, (state, action) => {
        state.info = {
          ...state.info,
          name: action.payload,
        } as any;
      })

      .addCase(reset, (state) => {
        state.info = undefined;
      });
  }
);

export const selectAccountInfo = (state: RootState) => state.accountInfo;

export default accountInfoReducer;
