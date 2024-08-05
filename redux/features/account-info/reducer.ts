import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import { loadInfo, reset } from "./action";
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
        state.isInfoLoading = false;
        if (!action.payload) return;
        state.info = action.payload;
      })
      .addCase(loadInfo.rejected, (state) => {
        state.isInfoLoading = false;
      })

      .addCase(reset, (state) => {
        state.info = undefined;
      });
  }
);

export const selectAccountInfo = (state: RootState) => state.accountInfo;

export default accountInfoReducer;
