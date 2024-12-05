import { DEFAULT_NETWORK } from "@/configs/common";
import { CkbNetwork } from "@/types/common";

export type StorageReducerType = {
  token: string;
  addressLogged: string;
  tokenExpired: number;
  network: CkbNetwork;
  isDontShowAgainTestnetPopup: boolean;
  tokens: { [key: string]: { name: string; symbol: string; decimal: number } };
};

export const defaultStorageReducer: StorageReducerType = {
  addressLogged: "",
  token: "",
  tokenExpired: 0,
  network:
    DEFAULT_NETWORK === "nervos"
      ? CkbNetwork.MiranaMainnet
      : CkbNetwork.MeepoTestnet,
  isDontShowAgainTestnetPopup: false,
  tokens: {},
};
