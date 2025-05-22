"use client";

import Button from "@/components/Common/Button";
import SwitchToken from "@/components/SwitchTokens";
import useAssets from "@/hooks/useAssets";
import { selectApp } from "@/redux/features/app/reducer";
import { useAppSelector } from "@/redux/hook";
import { BatchTransferType } from "@/types/account";
import { Switch } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import cn from "@/utils/cn";
import {
  FIXED_FEE,
  formatNumber,
  parseRecipientInput,
  shortAddress,
} from "@/utils/helpers";
import { BI, helpers } from "@ckb-lumos/lumos";
import { ccc } from "@ckb-ccc/connector-react";
import { toast } from "react-toastify";
import { selectStorage } from "@/redux/features/storage/reducer";
import { CkbNetwork } from "@/types/common";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import { RcFile } from "antd/es/upload";
import { validateBatchInputs } from "./validate";
import AmountType from "./AmountType";
import UploadFile from "./UploadFile";
import useCreateTransaction from "@/hooks/useCreateTransaction";

const CreateBatchTransferTx = ({
  txInfo,
  setTxInfo,
  onNext,
}: {
  txInfo: BatchTransferType;
  setTxInfo: (info: BatchTransferType) => void;
  onNext: () => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isUploadFile, setIsUploadFile] = useState(false);
  const [file, setFile] = useState<RcFile | File | undefined>();
  const { network } = useAppSelector(selectStorage);
  const { assets } = useAssets();
  const [errors, setErrors] = useState<{ address: string[]; amount: string }>({
    address: [],
    amount: "",
  });

  const { isTxLoading, isTxPending } = useCreateTransaction();

  const assetBalance = useMemo(() => {
    if (txInfo.token) {
      return txInfo.token?.balance || 0;
    }

    return Number(ccc.fixedPointToString(assets.balance.toBigInt()));
  }, [assets, txInfo.token]);

  const totalAmount = useMemo(() => {
    return txInfo.tos.reduce((total, to) => total + to.amount, 0);
  }, [txInfo.tos]);

  useEffect(() => {
    if (!inputValue) {
      setTxInfo({ ...txInfo, tos: [] });
      return;
    }
    const recipients = parseRecipientInput(
      inputValue,
      txInfo.isCustomAmount,
      txInfo.amount || 0
    );
    setTxInfo({ ...txInfo, tos: recipients });
  }, [inputValue, txInfo.isCustomAmount, txInfo.amount]);

  useEffect(() => {
    validateBatchInputs(txInfo, network, setErrors);
  }, [txInfo]);

  const isValidBalance = useCallback(() => {
    const amountBI = BI.from(ccc.fixedPointFrom(totalAmount.toString()));
    const balanceBI = BI.from(ccc.fixedPointFrom(assetBalance.toString()));
    return txInfo.is_include_fee
      ? amountBI.lte(balanceBI)
      : amountBI.add(FIXED_FEE).lte(balanceBI);
  }, [assetBalance, totalAmount, txInfo.is_include_fee]);

  const isValidAmount = useCallback(
    (ckbMinTransfer: number) => {
      let amount = totalAmount;
      if (txInfo.is_include_fee) {
        const fee = BI.from(txInfo.fee || FIXED_FEE);
        amount -= Number(ccc.fixedPointToString(fee.toBigInt()));
      }

      return !!txInfo.token ? totalAmount > 0 : totalAmount >= ckbMinTransfer;
    },
    [totalAmount, txInfo.is_include_fee, txInfo.token]
  );

  const isValidRemainingBalance = useCallback(
    (ckbMinTransfer: number) => {
      const _amount = BI.from(ccc.fixedPointFrom(totalAmount.toString())).add(
        txInfo.is_include_fee ? 0 : FIXED_FEE
      );

      const _balance = BI.from(ccc.fixedPointFrom(assetBalance.toString()));

      const _remaining = BI.from(_balance).sub(_amount);

      return _remaining.lte(0) || _remaining.gte(ckbMinTransfer * 100_000_000);
    },
    [assetBalance, totalAmount, txInfo.is_include_fee]
  );

  const next = useCallback(() => {
    if (txInfo.tos.length === 0)
      return toast.warning("Please enter the recipient's address.");

    if (totalAmount <= 0) {
      return toast.error(
        "The transfer amount must be greater than 0. Please enter a valid amount."
      );
    }

    const lumosConfig = network === CkbNetwork.MeepoTestnet ? AGGRON4 : LINA;

    let ckbMinTransfer: number = 0;
    txInfo.tos.forEach((to) => {
      try {
        const toScript = helpers.parseAddress(to.address, {
          config: lumosConfig,
        });
        const minCkb = Number(
          ccc.fixedPointToString(
            helpers.minimalCellCapacity({
              cellOutput: {
                capacity: "0x0",
                lock: toScript,
              },
              data: "0x",
            })
          )
        );

        ckbMinTransfer += minCkb;
      } catch (e) {
        return toast.warning("Recipient's address is invalid.");
      }
    });

    if (!txInfo.token) {
      if (!isValidAmount(ckbMinTransfer)) {
        const fee = BI.from(txInfo.fee || FIXED_FEE);
        return toast.warning(
          `The minimum amount is ${
            ckbMinTransfer +
            (txInfo.is_include_fee
              ? Number(ccc.fixedPointToString(fee.toBigInt()))
              : 0)
          } CKB.`
        );
      }

      if (!isValidRemainingBalance(ckbMinTransfer))
        return toast.warning(
          `The remaining balance in the ${shortAddress(
            txInfo.from,
            5
          )} wallet must be at least ${ckbMinTransfer} CKB after sending the amount plus fee.`
        );
    }

    if (!isValidBalance())
      return toast.warning(
        `Insufficient balance: Total amount plus fee exceeds ${formatNumber(
          assetBalance
        )} ${txInfo.token ? txInfo.token.symbol : "CKB"} in the ${shortAddress(
          txInfo.from,
          5
        )} wallet.`
      );
    onNext();
  }, [
    assetBalance,
    isValidAmount,
    isValidBalance,
    isValidRemainingBalance,
    network,
    onNext,
    txInfo.tos,
  ]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e?.target?.result as string;
        const rows = text.trim().split("\n");
        let input = "";
        for (const row of rows.slice(1)) {
          try {
            const cols = row.trim().split(",");
            const address = cols[0].trim();
            const amount = cols.length > 1 ? cols[1].trim() : null;
            if (txInfo.isCustomAmount && !Number(amount)) {
              return toast.error("Invalid amount");
            }
            input += `${address}`;
            if (txInfo.isCustomAmount) {
              input += `,${amount}`;
            }
            input += "\n";
          } catch (e: any) {
            return toast.error(e.message);
          }
        }
        setIsUploadFile(false);
        setInputValue(input);
      };
      reader.readAsText(file);
    }
  }, [file, txInfo.isCustomAmount]);

  useEffect(() => {
    if (txInfo.tos?.length > 0) {
      const inputDefault = txInfo.isCustomAmount
        ? txInfo.tos.map((to) => `${to.address},${to.amount}`).join("\n")
        : txInfo.tos.map((to) => `${to.address}`).join("\n");

      setInputValue(inputDefault);
    }
  }, [txInfo.isCustomAmount]);

  return (
    <>
      <p className="text-[24px] leading-[28px] font-medium text-dark-100 px-6 border-b border-grey-300 pb-4">
        UTXO Batch Transfer
      </p>
      <div className="pt-4 px-6 grid gap-4">
        <div className="grid gap-2">
          <p className="text-[16px] leading-[20px] text-grey-400">Token</p>
          <div className="rounded-lg border border-grey-200 py-[7px] px-4 max-w-max">
            <SwitchToken
              iconClassname="w-8 h-8"
              selToken={txInfo.token}
              onChange={(token) => {
                setTxInfo({
                  ...txInfo,
                  token,
                });
              }}
            />
          </div>
        </div>
        <AmountType
          isCustom={txInfo.isCustomAmount}
          setIsCustom={(value: boolean) =>
            setTxInfo({ ...txInfo, isCustomAmount: value })
          }
          setPlaceholder={setPlaceholder}
        />
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <div className="text-[16px] leading-[20px] text-grey-400">
              Recipient Address List
            </div>
            <div className="border border-grey-200 rounded-2xl">
              <button
                className={cn(
                  " px-2 py-1 text-sm rounded-2xl transition-all text-grey-400",
                  {
                    "!bg-dark-300 !text-grey-300": !isUploadFile,
                  }
                )}
                onClick={() => setIsUploadFile(false)}
              >
                Manual Input
              </button>
              <button
                className={cn(
                  "px-2 py-1 text-sm rounded-2xl transition-all text-grey-400",
                  {
                    "!bg-dark-300 !text-grey-300": isUploadFile,
                  }
                )}
                onClick={() => setIsUploadFile(true)}
              >
                Upload File
              </button>
            </div>
          </div>
          {isUploadFile ? (
            <UploadFile setFile={setFile} />
          ) : (
            <textarea
              className="rounded-lg border border-grey-200 py-[11px] outline-none flex-1 placeholder:text-grey-400 text-dark-100 resize-none px-4 w-full h-40"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
              placeholder={placeholder}
            />
          )}
          {errors.address?.length > 0 && (
            <div className="mt-1 bg-[#FF3333]/20 text-[#141414] text-sm leading-[140%] font-normal p-2 rounded-lg flex items-start gap-2">
              <IcnError />
              <div className="flex flex-col gap-2">
                {errors.address.map((e, i) => (
                  <p key={`add-error-${i}`}>{e}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {!txInfo.isCustomAmount && (
          <div className="grid gap-2">
            <p className="text-[16px] leading-[20px] text-grey-400">
              Amount per Address Transfer
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-grey-200 py-[19px] px-4 flex items-center gap-4 flex-1">
                <NumericFormat
                  allowNegative={false}
                  className="border-none outline-none flex-1 placeholder:text-grey-400 text-dark-100"
                  decimalScale={8}
                  isAllowed={(values) => {
                    const { floatValue } = values;
                    if (!floatValue) return true;
                    return (floatValue as any) <= 999999;
                  }}
                  value={txInfo.amount || 0}
                  onChange={(e) => {
                    setTxInfo({
                      ...txInfo,
                      amount: Number(e.target.value.replaceAll(",", "")),
                    });
                  }}
                  placeholder="Enter amount"
                  thousandSeparator=","
                />
                <p className="text-base text-dark-100 cursor-pointer font-medium">
                  {txInfo.token?.symbol || "CKB"}
                </p>
              </div>
            </div>
            {!!errors.amount && (
              <div className="text-sm text-[#FF3333]">{errors.amount}</div>
            )}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <p className="text-base text-grey-400">Include Fee In The Amount</p>
          <Switch
            value={txInfo.is_include_fee}
            onChange={(isChecked) => {
              setTxInfo({ ...txInfo, is_include_fee: isChecked });
            }}
          />
        </div>
      </div>

      <div className="px-6 mt-6">
        {isTxPending && (
          <div className="text-sm text-[#FF3333] mb-1">
            * You have a pending transaction. Please complete or cancel it
            before creating a new one.
          </div>
        )}
        <Button
          fullWidth
          onClick={next}
          disabled={
            txInfo.tos.length === 0 ||
            totalAmount === 0 ||
            errors.address.length > 0 ||
            !!errors.amount ||
            isTxPending
          }
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default CreateBatchTransferTx;

const IcnError = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.528 2.28312C10.9773 2.03017 11.4842 1.89728 11.9998 1.89728C12.5154 1.89728 13.0223 2.03017 13.4716 2.28312C13.9209 2.53607 14.2974 2.90055 14.5648 3.34139L14.5677 3.34614L23.0376 17.4862L23.0458 17.5C23.3077 17.9536 23.4463 18.4679 23.4478 18.9917C23.4493 19.5156 23.3135 20.0307 23.0541 20.4858C22.7947 20.9408 22.4207 21.3201 21.9692 21.5857C21.5177 21.8514 21.0046 21.9942 20.4808 22L20.4698 22.0001L3.51879 22C2.99498 21.9943 2.48182 21.8514 2.03035 21.5857C1.57887 21.3201 1.20483 20.9408 0.945426 20.4858C0.686022 20.0307 0.550303 19.5156 0.55177 18.9917C0.553236 18.4679 0.691839 17.9536 0.953786 17.5L0.961909 17.4862L9.43191 3.34615L10.2898 3.86001L9.43478 3.34139C9.70218 2.90055 10.0787 2.53607 10.528 2.28312ZM11.146 4.37666L2.68246 18.5058C2.59729 18.6556 2.55224 18.8249 2.55176 18.9973C2.55127 19.172 2.59651 19.3436 2.68298 19.4953C2.76945 19.647 2.89413 19.7735 3.04462 19.862C3.1938 19.9498 3.36317 19.9973 3.53617 20H20.4634C20.6364 19.9973 20.8058 19.9498 20.9549 19.862C21.1054 19.7735 21.2301 19.647 21.3166 19.4953C21.403 19.3436 21.4483 19.172 21.4478 18.9973C21.4473 18.825 21.4023 18.6557 21.3171 18.5059L12.8548 4.37865C12.8544 4.37799 12.854 4.37732 12.8536 4.37666C12.7645 4.23061 12.6395 4.10983 12.4904 4.02589C12.3406 3.94157 12.1716 3.89728 11.9998 3.89728C11.8279 3.89728 11.6589 3.94157 11.5092 4.02589C11.3601 4.10983 11.235 4.23061 11.146 4.37666Z"
        fill="#FF4545"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 8C12.5523 8 13 8.44772 13 9V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V9C11 8.44772 11.4477 8 12 8Z"
        fill="#FF4545"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 17C11 16.4477 11.4477 16 12 16H12.01C12.5623 16 13.01 16.4477 13.01 17C13.01 17.5523 12.5623 18 12.01 18H12C11.4477 18 11 17.5523 11 17Z"
        fill="#FF4545"
      />
    </svg>
  );
};
