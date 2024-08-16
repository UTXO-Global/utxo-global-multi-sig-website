import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import { loadCkbPrice } from "./action";
import { defaultAppReducer } from "./type";

const appReducer = createReducer(defaultAppReducer, (builder) => {
  builder
    // load ckb price
    .addCase(loadCkbPrice.fulfilled, (state, action) => {
      state.ckbPrice = action.payload;
    });
});

export const selectApp = (state: RootState) => state.app;

export default appReducer;
