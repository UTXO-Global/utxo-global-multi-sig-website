import { BatchTransferType } from "@/types/account";
import { CkbNetwork } from "@/types/common";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import { helpers, BI } from "@ckb-lumos/lumos";
import { toast } from "react-toastify";
import { FIXED_FEE, formatNumber, shortAddress } from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";

export const validateBatchInputs = (
  txInfo: BatchTransferType,
  network: CkbNetwork,
  setErrors: (errors: { address: string[]; amount: string }) => void
) => {
  const lumosConfig = network === CkbNetwork.MeepoTestnet ? AGGRON4 : LINA;
  let minTransferCkb = 0;
  const addressErrors: string[] = [];

  txInfo.tos.forEach((to, idx) => {
    try {
      const toScript = helpers.parseAddress(to.address, {
        config: lumosConfig,
      });
      const minCKBbyAddr = Number(
        ccc.fixedPointToString(
          helpers.minimalCellCapacity({
            cellOutput: { capacity: "0x0", lock: toScript },
            data: "0x",
          })
        )
      );
      if (minCKBbyAddr > minTransferCkb) minTransferCkb = minCKBbyAddr;

      if (txInfo.isCustomAmount) {
        if (!!txInfo.token && to.amount <= 0) {
          addressErrors.push(`Line ${idx + 1}: Amount must be greater than 0`);
        } else if (!txInfo.token && to.amount < minCKBbyAddr) {
          addressErrors.push(
            `Line ${idx + 1}: Minimum amount is ${minCKBbyAddr}`
          );
        }
      }
    } catch (_) {
      addressErrors.push(`Line ${idx + 1}: Address invalid`);
    }
  });

  let amountError = "";
  if (!txInfo.isCustomAmount) {
    if (!txInfo.token && (txInfo.amount || 0) < minTransferCkb) {
      amountError = `Minimum amount is ${minTransferCkb}`;
    }

    if (txInfo.token && (txInfo.amount || 0) <= 0) {
      amountError = `Amount must be greater than 0`;
    }
  }

  setErrors({ address: addressErrors, amount: amountError });
};

export const validateAndProceed = ({
  txInfo,
  assetBalance,
  network,
  onNext,
}: {
  txInfo: BatchTransferType;
  assetBalance: number;
  network: CkbNetwork;
  onNext: () => void;
}) => {
  if (txInfo.tos.length === 0) {
    return toast.warning("Please enter the recipient's address.");
  }

  const totalAmount = txInfo.tos.reduce((sum, to) => sum + to.amount, 0);
  if (totalAmount <= 0) {
    return toast.error("The transfer amount must be greater than 0.");
  }

  const lumosConfig = network === CkbNetwork.MeepoTestnet ? AGGRON4 : LINA;
  let ckbMinTransfer = 0;

  for (const to of txInfo.tos) {
    try {
      const script = helpers.parseAddress(to.address, { config: lumosConfig });
      const min = BI.from(
        helpers.minimalCellCapacity({
          cellOutput: { capacity: "0x0", lock: script },
          data: "0x",
        })
      )
        .div(10 ** 8)
        .toNumber();
      ckbMinTransfer += min;
    } catch (_) {
      return toast.warning("Recipient's address is invalid.");
    }
  }

  const fee = txInfo.is_include_fee ? 0 : FIXED_FEE / 10 ** 8;
  const required = totalAmount + fee;

  if (!txInfo.token && totalAmount < ckbMinTransfer + fee) {
    return toast.warning(`Minimum required: ${ckbMinTransfer + fee} CKB.`);
  }

  const balance = assetBalance;
  if (required > balance) {
    return toast.warning(
      `Insufficient balance: Need ${formatNumber(
        required
      )} but only have ${formatNumber(balance)} in ${shortAddress(
        txInfo.from,
        5
      )}.`
    );
  }

  const remain = balance - required;
  if (!txInfo.token && remain < ckbMinTransfer) {
    return toast.warning(
      `Remaining balance must be at least ${ckbMinTransfer} CKB.`
    );
  }

  onNext();
};
