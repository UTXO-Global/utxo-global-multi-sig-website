import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import { load, reset } from "./action";
import { defaultAddressBookReducer } from "./type";

const addressBookReducer = createReducer(
  defaultAddressBookReducer,
  (builder) => {
    builder
      // load
      .addCase(load.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(load.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload) return;
        state.data = action.payload;
      })
      .addCase(load.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(reset, (state) => {
        state.data = [];
      });
  }
);

export const selectAddressBook = (state: RootState) => state.addressBook;

export default addressBookReducer;
