import { createAsyncThunk } from "@reduxjs/toolkit";

export const loadCkbPrice = createAsyncThunk("app/load-ckb-price", async () => {
  try {
    const res = await fetch(`https://api.coincap.io/v2/assets/nervos-network`)
    const data = await res.json()
    return data.data.priceUsd
  } catch (e) {
    console.error(e)
    return 0
  }
})