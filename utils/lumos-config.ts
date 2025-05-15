import { predefined } from "@ckb-lumos/config-manager";
import { Config } from "@ckb-lumos/config-manager";

export const AGGRON4: Config = {
  ...predefined.AGGRON4,
  SCRIPTS: {
    ...predefined.AGGRON4.SCRIPTS,
    SECP256K1_BLAKE160_MULTISIG: {
      CODE_HASH:
        "0x765b3ed6ae264b335d07e73ac332bf2c0f38f8d3340ed521cb447b4c42dd5f09",
      HASH_TYPE: "type",
      TX_HASH:
        "0xe6774580c98c8b15799c628f539ed5722f3bc2b17206c2280e15f99be3c1ad71",
      INDEX: "0x0",
      DEP_TYPE: "code",
      SHORT_ID: 1,
    },
    RUSD: {
      CODE_HASH:
        "0x1142755a044bf2ee358cba9f2da187ce928c91cd4dc8692ded0337efa677d21a",
      HASH_TYPE: "type",
      TX_HASH:
        "0xed7d65b9ad3d99657e37c4285d585fea8a5fcaf58165d54dacf90243f911548b",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
    USDI: {
      CODE_HASH:
        "0xcc9dc33ef234e14bc788c43a4848556a5fb16401a04662fc55db9bb201987037",
      HASH_TYPE: "type",
      TX_HASH:
        "0xaec423c2af7fe844b476333190096b10fc5726e6d9ac58a9b71f71ffac204fee",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
  },
};

export const LINA: Config = {
  ...predefined.LINA,
  SCRIPTS: {
    ...predefined.LINA.SCRIPTS,
    SECP256K1_BLAKE160_MULTISIG: {
      CODE_HASH:
        "0xd1a9f877aed3f5e07cb9c52b61ab96d06f250ae6883cc7f0a2423db0976fc821",
      HASH_TYPE: "type",
      TX_HASH:
        "0x0a13d8d9c83c3374196ee43d4f0116dac497b0fec3e71c04f7cb7780abc455d8",
      INDEX: "0x0",
      DEP_TYPE: "code",
      SHORT_ID: 1,
    },
    RUSD: {
      CODE_HASH:
        "0x26a33e0815888a4a0614a0b7d09fa951e0993ff21e55905510104a0b1312032b",
      HASH_TYPE: "type",
      TX_HASH:
        "0x8ec1081bd03e5417bb4467e96f4cec841acdd35924538a35e7547fe320118977",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
    USDI: {
      CODE_HASH:
        "0xbfa35a9c38a676682b65ade8f02be164d48632281477e36f8dc2f41f79e56bfc",
      HASH_TYPE: "type",
      TX_HASH:
        "0xf6a5eef65101899db9709c8de1cc28f23c1bee90d857ebe176f6647ef109e20d",
      INDEX: "0x0",
      DEP_TYPE: "code",
    },
  },
};
