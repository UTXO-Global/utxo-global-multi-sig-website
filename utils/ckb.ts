import { CellDep, helpers, Script, WitnessArgs } from "@ckb-lumos/lumos";
import { blockchain, bytes } from "@ckb-lumos/lumos/codec";
import { Config } from "@ckb-lumos/lumos/config";

export const prepareMultisigWitness = (
  txSkeleton: helpers.TransactionSkeletonType,
  fromScript: Script,
  witnessData: string,
  threshold: number
) => {
  const firstIndex = txSkeleton
    .get("inputs")
    .findIndex((input: any) =>
      bytes.equal(
        blockchain.Script.pack(input.cellOutput.lock),
        blockchain.Script.pack(fromScript)
      )
    );

  if (firstIndex !== -1) {
    while (txSkeleton.get("witnesses").size < txSkeleton.get("inputs").size) {
      txSkeleton = txSkeleton.update("witnesses", (witnesses: any) =>
        witnesses.push("0x")
      );
    }

    let witness: string = txSkeleton.get("witnesses").get(firstIndex)!;
    const SECP_SIGNATURE_PLACEHOLDER = "00".repeat(65);

    let newWitnessArgs: WitnessArgs = {
      lock: "0x" + witnessData + SECP_SIGNATURE_PLACEHOLDER.repeat(threshold!),
    };

    if (witness !== "0x") {
      const witnessArgs = blockchain.WitnessArgs.unpack(bytes.bytify(witness));
      const lock = witnessArgs.lock;
      if (
        !!lock &&
        !!newWitnessArgs.lock &&
        !bytes.equal(lock, newWitnessArgs.lock)
      ) {
        throw new Error(
          "Lock field in first witness is set aside for signature!"
        );
      }

      const inputType = witnessArgs.inputType;
      if (!!inputType) {
        newWitnessArgs.inputType = inputType;
      }

      const outputType = witnessArgs.outputType;
      if (!!outputType) {
        newWitnessArgs.outputType = outputType;
      }
    }

    witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
    return txSkeleton.update("witnesses", (witnesses: any) =>
      witnesses.set(firstIndex, witness)
    );
  }

  return txSkeleton;
};

export const addMultisigCellDeps = (
  txSkeleton: helpers.TransactionSkeletonType,
  lumosConfig: Config,
  cellDepCustom?: CellDep[]
) => {
  return txSkeleton.update("cellDeps", (cellDeps: any) =>
    cellDeps.push(
      ...[
        ...(cellDepCustom || []),
        {
          outPoint: {
            txHash: lumosConfig.SCRIPTS.DAO?.TX_HASH!,
            index: "0x3",
          },
          depType: lumosConfig.SCRIPTS.DAO?.DEP_TYPE!,
        },
        {
          outPoint: {
            txHash: lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.TX_HASH!,
            index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.INDEX!,
          },
          depType: lumosConfig.SCRIPTS.SECP256K1_BLAKE160_MULTISIG?.DEP_TYPE!,
        },
      ]
    )
  );
};

export const getxudtType = (typeScript: any, lumosConfig: Config) => {
  const { args, code_hash, hash_type } = typeScript!;
  const isRUSD = lumosConfig.SCRIPTS.RUSD?.CODE_HASH === code_hash;
  const isUSDI = lumosConfig.SCRIPTS.USDI?.CODE_HASH === code_hash;
  if (isRUSD) {
    return {
      codeHash: lumosConfig.SCRIPTS.RUSD?.CODE_HASH,
      hashType: lumosConfig.SCRIPTS.RUSD?.HASH_TYPE,
      args,
    } as Script;
  }

  if (isUSDI) {
    return {
      codeHash: lumosConfig.SCRIPTS.USDI?.CODE_HASH,
      hashType: lumosConfig.SCRIPTS.USDI?.HASH_TYPE,
      args,
    } as Script;
  }
  return {
    codeHash: code_hash,
    hashType: hash_type,
    args,
  } as Script;
};

export const getxudtCellDeps = (codeHash: string, lumosConfig: Config) => {
  const isRUSD = lumosConfig.SCRIPTS.RUSD?.CODE_HASH === codeHash;
  const isUSDI = lumosConfig.SCRIPTS.USDI?.CODE_HASH === codeHash;
  if (isRUSD) {
    return {
      outPoint: {
        txHash: lumosConfig.SCRIPTS.RUSD!.TX_HASH,
        index: lumosConfig.SCRIPTS.RUSD!.INDEX,
      },
      depType: lumosConfig.SCRIPTS.RUSD!.DEP_TYPE,
    };
  }

  if (isUSDI) {
    return {
      outPoint: {
        txHash: lumosConfig.SCRIPTS.USDI!.TX_HASH,
        index: lumosConfig.SCRIPTS.USDI!.INDEX,
      },
      depType: lumosConfig.SCRIPTS.USDI!.DEP_TYPE,
    };
  }

  return {
    outPoint: {
      txHash: lumosConfig.SCRIPTS.XUDT!.TX_HASH,
      index: lumosConfig.SCRIPTS.XUDT!.INDEX,
    },
    depType: lumosConfig.SCRIPTS.XUDT!.DEP_TYPE,
  };
};
