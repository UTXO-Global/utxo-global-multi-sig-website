"use client";

import Button from "@/components/Common/Button";
import SwitchToken from "@/components/SwitchTokens";
import useAssets from "@/hooks/useAssets";
import { selectApp } from "@/redux/features/app/reducer";
import { useAppSelector } from "@/redux/hook";
import { PatchTransferType } from "@/types/account";
import { Switch } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import cn from "@/utils/cn";
import { FIXED_FEE, formatNumber, shortAddress } from "@/utils/helpers";
import { BI, helpers } from "@ckb-lumos/lumos";
import { ccc } from "@ckb-ccc/connector-react";
import { toast } from "react-toastify";
import { selectStorage } from "@/redux/features/storage/reducer";
import { CkbNetwork } from "@/types/common";
import { AGGRON4, LINA } from "@/utils/lumos-config";

import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { RcFile } from "antd/es/upload";

const exampleSamePrice =
  "Example\nckb1qzda0cr08m...rdsr9lalq\nckb1qzda0cr08m...jq2rdms8";
const exampleCustomPrice =
  "Example\nckb1qzda0cr08m...rdsr9lalq,100\nckb1qzda0cr08m...jq2rdms8,200";
const CreatePatchTransferTx = ({
  txInfo,
  setTxInfo,
  onNext,
}: {
  txInfo: PatchTransferType;
  setTxInfo: (info: PatchTransferType) => void;
  onNext: () => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [placeholder, setPlaceholder] = useState(exampleSamePrice);
  const [isTransferCustomAmount, setIsTransferCustomAmount] = useState(false);
  const [isUploadFile, setIsUploadFile] = useState(false);
  const [file, setFile] = useState<RcFile | File | undefined>();
  const { config } = useAppSelector(selectApp);
  const { network } = useAppSelector(selectStorage);
  const { assets } = useAssets();

  const props: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".csv",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      if (file) {
        setFile(file);
      }
      return false;
    },
  };

  const assetBalance = useMemo(() => {
    if (txInfo.token) {
      return txInfo.token?.balance || 0;
    }

    return Number(assets.balance) / 10 ** 8;
  }, [assets, txInfo.token]);

  useEffect(() => {
    const recipients: { address: string; amount: number }[] = [];
    const addresses = inputValue.trim().split("\n");
    addresses.forEach((address) => {
      const info = address.trim().split(",");
      let amount = txInfo.amount || 0;
      if (isTransferCustomAmount) {
        amount = info.length > 1 ? Number(info[1].trim()) : 0;
      }

      recipients.push({
        address: info[0].trim(),
        amount: amount,
      });
    });
    setTxInfo({
      ...txInfo,
      tos: recipients,
    });
  }, [inputValue, isTransferCustomAmount, txInfo.amount]);

  const totalAmount = useMemo(() => {
    return txInfo.tos.reduce((total, to) => total + to.amount, 0);
  }, [txInfo.tos]);

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
        amount -= FIXED_FEE / 10 ** 8;
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

    let ckbMinTransfer = 61;
    txInfo.tos.forEach((to) => {
      try {
        const toScript = helpers.parseAddress(to.address, {
          config: lumosConfig,
        });
        const isAddressTypeJoy = ccc.bytesFrom(toScript.args).length > 20;
        if (isAddressTypeJoy) {
          ckbMinTransfer = 63;
        }
      } catch (e) {
        return toast.warning("Recipient's address is invalid.");
      }
    });

    if (!txInfo.token) {
      if (!isValidAmount(ckbMinTransfer))
        return toast.warning(
          `The minimum amount is ${
            ckbMinTransfer + (txInfo.is_include_fee ? FIXED_FEE / 10 ** 8 : 0)
          } CKB.`
        );

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

  const AmountType = () => {
    return (
      <div className="bg-grey-300 p-2 flex gap-2 max-w-max rounded-lg">
        <Button
          className={cn({
            "!bg-grey-300 !border-none !text-dark-300": isTransferCustomAmount,
          })}
          onClick={() => {
            setIsTransferCustomAmount(false);
            setPlaceholder(exampleSamePrice);
          }}
        >
          Transfer Same Amount
        </Button>
        <Button
          className={cn({
            "!bg-grey-300 !border-none !text-dark-300": !isTransferCustomAmount,
          })}
          onClick={() => {
            setIsTransferCustomAmount(true);
            setPlaceholder(exampleCustomPrice);
          }}
        >
          Transfer Custom Amount
        </Button>
      </div>
    );
  };

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
            if (isTransferCustomAmount && !Number(amount)) {
              return toast.error("Invalid amount");
            }
            input += `${address}`;
            if (isTransferCustomAmount) {
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
  }, [file, isTransferCustomAmount]);

  const UploadFile = () => {
    return (
      <Dragger {...props} className="w-full">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Supported file types: CSV</p>
      </Dragger>
    );
  };

  return (
    <>
      <p className="text-[24px] leading-[28px] font-medium text-dark-100 px-6 border-b border-grey-300 pb-4">
        UTXO Patch Transfer
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
        <AmountType />
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
            <UploadFile />
          ) : (
            <textarea
              className="rounded-lg border border-grey-200 py-[11px] outline-none flex-1 placeholder:text-grey-400 text-dark-100 resize-none px-4 w-full h-40"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
              placeholder={placeholder}
            />
          )}
        </div>

        {!isTransferCustomAmount && (
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
        <Button
          fullWidth
          onClick={next}
          disabled={txInfo.tos.length === 0 || totalAmount === 0}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default CreatePatchTransferTx;
