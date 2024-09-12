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
  },
};

export const LINA: Config = {
  ...predefined.LINA,
  SCRIPTS: {
    ...predefined.AGGRON4.SCRIPTS,
    SECP256K1_BLAKE160_MULTISIG: {
      CODE_HASH:
        "0xd1a9f877aed3f5e07cb9c52b61ab96d06f250ae6883cc7f0a2423db0976fc821",
      HASH_TYPE: "type",
      TX_HASH:
        "0x0a13d8d9c83c3374196ee43d4f0116dac497b0fec3e71c04f7cb7780abc455d8",
      INDEX: "0x0",
      DEP_TYPE: "depGroup",
      SHORT_ID: 1,
    },
  },
};
