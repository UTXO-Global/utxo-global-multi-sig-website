import { DEFAULT_NETWORK } from "@/configs/common";
import {
  INetworkConfig,
  MAINNET_CONFIG,
  TESTNET_CONFIG,
} from "@/configs/network";

export type AppReducerType = {
  ckbPrice: number;
  tokenRates: { [key: string]: number };
  config: INetworkConfig;
};

export const defaultAppReducer: AppReducerType = {
  ckbPrice: 0,
  tokenRates: {},
  config:
    DEFAULT_NETWORK === "nervos"
      ? { ...MAINNET_CONFIG }
      : { ...TESTNET_CONFIG },
};
