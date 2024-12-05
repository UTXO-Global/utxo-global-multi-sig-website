import { createReducer } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { loadCkbAddressInfo } from "./action";
import { defaultAssetsReducer } from "./type";

const assetReducer = createReducer(defaultAssetsReducer, (builder) => {
  builder
    .addCase(loadCkbAddressInfo.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(loadCkbAddressInfo.fulfilled, (state, action) => {
      state.assets = action.payload;
      state.isLoading = false;
    })
    .addCase(loadCkbAddressInfo.rejected, (state) => {
      state.isLoading = false;
    });
});

export const selectAssets = (state: RootState) => state.asset;

export default assetReducer;
