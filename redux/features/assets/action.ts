import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectApp } from "../app/reducer";
import { RootState } from "@/redux/store";
import {
  AssetSummaryType,
  CKBAddressInfo,
  defaultAssetsReducer,
  UdtBalanceType,
} from "./type";
import { BI } from "@ckb-lumos/lumos";

export const loadCkbAddressInfo = createAsyncThunk<
  AssetSummaryType,
  string,
  { state: RootState }
>("assets/address-info", async (address: string, { getState }) => {
  try {
    const { config: appConfig } = selectApp(getState());

    const res = await fetch(
      `${appConfig.explorerAPI}/api/v1/addresses/${address}`,
      {
        headers: {
          "content-type": "application/vnd.api+json",
          accept: "application/vnd.api+json",
        },
      }
    );

    const { data } = await res.json();
    const addressInfo = data[0] as CKBAddressInfo;
    const udtBalances: {
      [typeHash: string]: UdtBalanceType;
    } = {};
    addressInfo.attributes.udt_accounts.forEach((a) => {
      try {
        udtBalances[a.type_hash] = {
          balance: Number(a.amount) / 10 ** Number(a.decimal),
          decimal: Number(a.decimal),
          rawBalance: a.amount,
          symbol: a.symbol,
          typeScript: a.udt_type_script,
        };
      } catch (e) {
        console.log(e);
      }
    });

    return {
      balance: BI.from(addressInfo.attributes.balance),
      balanceOccupied: BI.from(addressInfo.attributes.balance_occupied),
      udtBalances,
    };
  } catch (e) {
    console.error(e);
    return defaultAssetsReducer.assets;
  }
});
