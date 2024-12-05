import { BI } from "@ckb-lumos/lumos";

export type UdtBalanceType = {
  balance: number;
  decimal: number;
  rawBalance: string;
  symbol: string;
  icon: string;
  typeScript: {
    args: string;
    code_hash: string;
    hash_type: string;
  };
};

export type CKBAddressInfo = {
  attributes: {
    address_hash: string;
    average_deposit_time: string;
    balance: string;
    balance_occupied: string;
    bitcoin_address_hash: string;
    dao_compensation: string;
    dao_deposit: string;
    interest: string;
    is_special: string;
    live_cells_count: string;
    lock_info: any;
    lock_script: {
      args: string;
      code_hash: string;
      hash_type: string;
    };
    mined_blocks_count: string;
    transactions_count: string;
    udt_accounts: {
      amount: string;
      decimal: string;
      symbol: string;
      type_hash: string;
      udt_icon_file: string;
      udt_type: string;
      udt_type_script: {
        args: string;
        code_hash: string;
        hash_type: string;
      };
    }[];
  };
  type: string;
  id: string;
};

export type AssetSummaryType = {
  balance: BI;
  balanceOccupied: BI;
  udtBalances: {
    [typeHash: string]: UdtBalanceType;
  };
};

export type AssetReducerType = {
  isLoading: boolean;
  assets: AssetSummaryType;
};

export const defaultAssetsReducer: AssetReducerType = {
  assets: {
    balance: BI.from(0),
    balanceOccupied: BI.from(0),
    udtBalances: {},
  },
  isLoading: true,
};
