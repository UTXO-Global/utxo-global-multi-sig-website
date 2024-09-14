/* eslint-disable @next/next/no-img-element */
"use client";

import { Switch } from "antd";
import { NumericFormat } from "react-number-format";

import SwitchNetwork from "@/components/SwitchNetwork";
import Button from "@/components/Common/Button";
import { SendTokenType } from "@/types/account";
import { useEffect, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { formatNumber } from "@/utils/helpers";
import useMultisigBalance from "@/hooks/useMultisigBalance";
import { SHORT_NETWORK_NAME } from "@/configs/network";
import { BI } from "@ckb-lumos/lumos";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";

const CKB_MIN_TRANSFER = 63; // 63 CKB
const CreateTx = ({
  txInfo,
  setTxInfo,
  onNext,
}: {
  txInfo: SendTokenType;
  setTxInfo: (info: SendTokenType) => void;
  onNext: () => void;
}) => {
  const { config } = useAppSelector(selectApp);
  const { balance } = useMultisigBalance();

  const balanceN = useMemo(() => {
    return Number(ccc.fixedPointToString(balance));
  }, [balance]);

  useEffect(() => {
    if (txInfo.amount === 0 || balanceN === 0) return;
    if (txInfo.amount >= balanceN) {
      setTxInfo({ ...txInfo, is_include_fee: true });
    }
  }, [balanceN, txInfo.amount]);

  const isValidTx = useMemo(() => {
    return (
      txInfo.send_to !== "" &&
      txInfo.amount >= CKB_MIN_TRANSFER &&
      txInfo.amount <= balanceN
    );
  }, [txInfo, balanceN]);

  return (
    <>
      <p className="text-[24px] leading-[28px] font-medium text-dark-100 px-6 border-b border-grey-300 pb-4">
        Send Tokens
      </p>
      <div className="pt-4 px-6 grid gap-4">
        <div className="grid gap-2">
          <p className="text-[16px] leading-[20px] text-grey-400">Send To</p>
          <div className="rounded-lg border border-grey-200 py-[11px] px-4 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 aspect-square rounded-full bg-grey-200"></div>
              <p className="text-[16px] leading-[20px] font-medium text-grey-500">
                {SHORT_NETWORK_NAME[config.network]}:
              </p>
            </div>
            <input
              type="text"
              className="border-none outline-none flex-1 placeholder:text-grey-400 text-dark-100"
              value={txInfo.send_to}
              onChange={(e) =>
                setTxInfo({ ...txInfo, send_to: e.target.value })
              }
            />
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-[16px] leading-[20px] text-grey-400">Amount</p>
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
                value={txInfo.amount}
                onChange={(e) => {
                  setTxInfo({
                    ...txInfo,
                    amount: Number(e.target.value.replaceAll(",", "")),
                  });
                }}
                placeholder="Enter amount"
                thousandSeparator=","
              />
              <p
                className="text-base text-dark-100 cursor-pointer font-medium"
                onClick={() =>
                  setTxInfo({
                    ...txInfo,
                    amount: balanceN,
                  })
                }
              >
                Max
              </p>
            </div>
            <div className="rounded-lg border border-grey-200 py-[7px] px-4">
              <SwitchNetwork
                iconClassname="w-8 h-8"
                customEl={
                  <span className="text-[14px] leading-[18px]">
                    {formatNumber(balanceN)} CKB
                  </span>
                }
              />
            </div>
          </div>
        </div>
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
          onClick={() => isValidTx && onNext()}
          disabled={!isValidTx}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default CreateTx;
