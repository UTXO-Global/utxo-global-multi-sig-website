import { createReducer } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { loadCkbAddressInfo } from "./action";
import { defaultAssetsReducer } from "./type";

const assetReducer = createReducer(defaultAssetsReducer, (builder) => {
  builder.addCase(loadCkbAddressInfo.fulfilled, (state, action) => {
    state.assets = action.payload;
  });
});

export const selectAssets = (state: RootState) => state.asset;

export default assetReducer;
