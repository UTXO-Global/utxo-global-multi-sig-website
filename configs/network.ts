export const NETWORK_NAME: { [key: string]: string } = {
  nervos_testnet: "Meepo Testnet",
  nervos: "Meepo Mainnet",
};

export const SHORT_NETWORK_NAME: { [key: string]: string } = {
  nervos_testnet: "Meepo",
  nervos: "Meepo",
};

export interface INetworkConfig {
  network: string;
  apiURL: string;
  explorer: string;
  explorerAPI: string;
  ckbRPC: string;
  isTestnet?: boolean;
}

export const TESTNET_CONFIG: INetworkConfig = {
  network: "nervos_testnet",
  //apiURL: "https://staging-api-720a.utxo.global", // "http://localhost:9001"
  apiURL: "http://localhost:9001",
  explorer: "https://testnet.explorer.nervos.org/en",
  explorerAPI: "https://testnet-api.explorer.nervos.org",
  ckbRPC: "https://testnet.ckb.dev/rpc",
  isTestnet: true,
};

export const MAINNET_CONFIG: INetworkConfig = {
  network: "nervos",
  apiURL: "https://api.utxo.global",
  explorer: "https://explorer.nervos.org/en",
  explorerAPI: "https://mainnet-api.explorer.nervos.org",
  ckbRPC: "https://mainnet.ckb.dev/rpc",
};
