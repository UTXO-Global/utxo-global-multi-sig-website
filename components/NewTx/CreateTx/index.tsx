/* eslint-disable @next/next/no-img-element */
"use client";

import { Switch } from "antd";
import { NumericFormat } from "react-number-format";

import Button from "@/components/Common/Button";
import { SendTokenType } from "@/types/account";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { FIXED_FEE, formatNumber, shortAddress } from "@/utils/helpers";
import useMultisigBalance from "@/hooks/useMultisigBalance";
import { SHORT_NETWORK_NAME } from "@/configs/network";
import { BI, helpers } from "@ckb-lumos/lumos";
import { useAppSelector } from "@/redux/hook";
import { selectApp } from "@/redux/features/app/reducer";
import { toast } from "react-toastify";
import { selectStorage } from "@/redux/features/storage/reducer";
import { CkbNetwork } from "@/types/common";
import { AGGRON4, LINA } from "@/utils/lumos-config";
import SwitchToken from "@/components/SwitchTokens";
import useAssets from "@/hooks/useAssets";
import { createInstance } from "dotbit";
import { useSearchParams } from "next/navigation";
import useCreateTransaction from "@/hooks/useCreateTransaction";

const dotbit = createInstance();

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
  const { network } = useAppSelector(selectStorage);
  const { balance, address } = useMultisigBalance();
  const [fieldFocus, setFieldFocus] = useState({
    sendTo: false,
    amount: false,
  });
  const [filtered, setFiltered] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(txInfo.send_to || "");
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const { assets } = useAssets();
  const [errors, setErrors] = useState<{
    amount?: string[];
    sendTo?: string[];
  }>({});

  const { isTxLoading, isTxPending } = useCreateTransaction({
    isLoadTxPending: true,
  });

  const lumosConfig = useMemo(() => {
    return network === CkbNetwork.MeepoTestnet ? AGGRON4 : LINA;
  }, [network]);

  const tokens = useMemo(() => {
    if (Object.values(assets.udtBalances).length > 0) {
      return Object.fromEntries(
        Object.entries(assets.udtBalances).filter(([_, udt]) => udt.balance > 0)
      );
    }
    return {};
  }, [assets]);

  const tokenBalance = useMemo(() => {
    if (txInfo.token) {
      return txInfo.token?.balance || 0;
    }

    return Number(ccc.fixedPointToString(assets.balance.toBigInt()));
  }, [assets, txInfo.token]);

  useEffect(() => {
    if (tokenParam) {
      const token = Object.values(tokens).find((t) => t.symbol === tokenParam);
      if (token) {
        setTxInfo({
          ...txInfo,
          token: {
            ...token,
            typeHash: token.typeScript.args,
          },
        });
      }
    }
  }, [tokenParam, tokens]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    try {
      if (inputValue.endsWith(".bit")) {
        timeout = setTimeout(() => {
          dotbit.records(inputValue).then((records) => {
            setFiltered(
              records.filter((z) => z.key === "address.ckb").map((j) => j.value)
            );
          });
        }, 500);
      } else {
        setFiltered([]);
        setTxInfo({
          ...txInfo,
          send_to: inputValue,
          isUseDID: filtered.includes(inputValue),
        });
      }
    } catch (e) {
      console.log(e);
    }

    return () => clearTimeout(timeout);
  }, [inputValue]);

  useEffect(() => {
    if (txInfo.amount === 0 || tokenBalance === 0) return;
    if (txInfo.amount >= tokenBalance) {
      setTxInfo({ ...txInfo, is_include_fee: true });
    }
  }, [tokenBalance, txInfo.amount]);

  const isValidBalance = useCallback(() => {
    const _amount = BI.from(ccc.fixedPointFrom(txInfo.amount.toString()));
    const _balance = BI.from(ccc.fixedPointFrom(tokenBalance.toString()));
    const fee = BI.from(txInfo.fee || FIXED_FEE);
    return txInfo.is_include_fee
      ? _amount.lte(_balance)
      : _amount.add(fee).lte(_balance);
  }, [tokenBalance, txInfo.amount, txInfo.is_include_fee, txInfo.fee]);

  const isValidAmount = useCallback(
    (ckbMinTransfer: number) => {
      let amount = txInfo.amount;
      const fee = BI.from(txInfo.fee || FIXED_FEE);
      if (txInfo.is_include_fee) {
        amount -= Number(ccc.fixedPointToString(fee.toBigInt()));
      }
      return amount >= ckbMinTransfer;
    },
    [txInfo.amount, txInfo.is_include_fee, txInfo.fee]
  );

  const isValidSendTo = useCallback(() => {
    try {
      if (!txInfo.send_to) return false;

      const toScript = helpers.parseAddress(txInfo.send_to, {
        config: lumosConfig,
      });

      return !!toScript;
    } catch (e) { }
    return false;
  }, [txInfo.send_to, lumosConfig]);

  const toScript = useMemo(() => {
    if (isValidSendTo()) {
      return helpers.parseAddress(txInfo.send_to, {
        config: lumosConfig,
      });
    }
    return undefined;
  }, [txInfo.send_to, lumosConfig]);

  const ckbMinTransfer = useMemo(() => {
    if (toScript) {
      return BI.from(
        helpers.minimalCellCapacity({
          cellOutput: {
            capacity: "0x0",
            lock: toScript,
          },
          data: "0x",
        })
      )
        .div(10 ** 8)
        .toNumber();
    }

    return 0;
  }, [toScript]);

  const isDisableNext = useMemo(() => {
    if (isTxPending) return true;

    if (!txInfo.send_to) return true;

    if (txInfo.amount <= 0) return true;

    if (errors.amount && errors.amount.length > 0) return true;
    if (errors.sendTo && errors.sendTo.length > 0) return true;

    return false;
  }, [isTxPending, errors]);

  const isValidRemainingBalance = useCallback(
    (ckbMinTransfer: number) => {
      const _amount = BI.from(ccc.fixedPointFrom(txInfo.amount.toString())).add(
        txInfo.is_include_fee ? 0 : FIXED_FEE
      );

      const _balance = BI.from(ccc.fixedPointFrom(tokenBalance.toString()));

      const _remaining = BI.from(_balance).sub(_amount);

      return _remaining.lte(0) || _remaining.gte(ckbMinTransfer * 100_000_000);
    },
    [tokenBalance, txInfo.amount, txInfo.is_include_fee]
  );

  const next = useCallback(() => {
    onNext();
  }, [onNext]);

  useEffect(() => {
    const errs = {
      sendTo: [] as string[],
      amount: [] as string[],
    };

    setErrors({});

    if (fieldFocus.sendTo) {
      if (inputValue.trim() === "") {
        errs.sendTo.push("Please enter a CKB address or .bit alias.");
      } else if (inputValue.endsWith(".bit")) {
        if (filtered.length === 0) {
          errs.sendTo.push("No CKB address found for this .bit alias.");
        }
      } else {
        if (!isValidSendTo()) {
          errs.sendTo.push("Invalid CKB address format");
        } else if (!txInfo.send_to.startsWith(lumosConfig.PREFIX)) {
          errs.sendTo.push("This address belongs to a different network.");
        }
      }

    }

    if (fieldFocus.amount) {
      if (txInfo.amount <= 0) {
        errs.amount.push(
          "The transfer amount must be greater than 0. Please enter a valid amount."
        );
      }

      if (!txInfo.token) {
        if (!isValidAmount(ckbMinTransfer))
          errs.amount.push(
            `The minimum amount is ${ckbMinTransfer + (txInfo.is_include_fee ? FIXED_FEE / 10 ** 8 : 0)
            } CKB.`
          );

        if (!isValidRemainingBalance(ckbMinTransfer)) {
          errs.amount.push(
            `The remaining balance in the ${shortAddress(
              address,
              5
            )} wallet must be at least ${ckbMinTransfer} CKB after sending the amount plus fee.`
          );
        }
      }

      if (!isValidBalance()) {
        errs.amount.push(
          `Insufficient balance: Total amount plus fee exceeds ${formatNumber(
            tokenBalance
          )} ${txInfo.token ? txInfo.token.symbol : "CKB"
          } in the ${shortAddress(address, 5)} wallet.`
        );
      }
    }

    setErrors({ ...errs });
  }, [
    txInfo,
    lumosConfig,
    ckbMinTransfer,
    toScript,
    inputValue,
    fieldFocus,
    filtered,
    isValidBalance,
    isValidAmount,
  ]);

  return (
    <>
      <p className="text-[24px] leading-[28px] font-medium text-dark-100 px-6 border-b border-grey-300 pb-4">
        New Transaction
      </p>
      <div className="pt-4 px-6 grid gap-4">
        <div className="grid gap-2">
          <p className="text-[16px] leading-[20px] text-grey-400">Send To</p>
          <div className="relative">
            <div className="rounded-lg border border-grey-200 py-[11px] px-4 flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img
                  src="/images/account.png"
                  alt="account"
                  className="w-10 aspect-square rounded-full"
                />

                <p className="text-[16px] leading-[20px] font-medium text-grey-500">
                  {SHORT_NETWORK_NAME[config.network]}:
                </p>
              </div>
              <input
                type="text"
                className="border-none outline-none flex-1 placeholder:text-grey-400 text-dark-100"
                value={inputValue}
                placeholder="Address/.bit"
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setFieldFocus({ ...fieldFocus, sendTo: true });
                }}
              />
            </div>
            {errors.sendTo && errors.sendTo.length > 0 && (
              <div className="text-sm text-[#FF3333] mb-1">
                * {errors.sendTo[0]}
              </div>
            )}
            {filtered.length > 0 && (
              <div className="absolute w-full rounded-lg border border-grey-200 min-h-[100px] max-h-[200px] overflow-auto shadow-sm left-0 mt-2 bg-light-100 py-2 z-10">
                {filtered.map((z, i) => (
                  <div
                    key={i}
                    className="py-2 px-4 hover:bg-grey-200 cursor-pointer"
                    onClick={() => {
                      setInputValue(z);
                      setFiltered([]);
                    }}
                  >
                    {shortAddress(z, 24)}
                  </div>
                ))}
              </div>
            )}
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
                onFocus={() => setFieldFocus({ ...fieldFocus, amount: true })}
              />
              <p
                className="text-base text-dark-100 cursor-pointer font-medium"
                onClick={() =>
                  setTxInfo({
                    ...txInfo,
                    amount: tokenBalance,
                  })
                }
              >
                Max
              </p>
            </div>
            <div className="rounded-lg border border-grey-200 py-[7px] px-4">
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
          {errors.amount && errors.amount.length > 0 && (
            <div className="text-sm text-[#FF3333] mb-1">
              * {errors.amount[0]}
            </div>
          )}
        </div>
        {!txInfo.token && (
          <div className="flex gap-2 items-center">
            <p className="text-base text-grey-400">Include Fee In The Amount</p>
            <Switch
              value={txInfo.is_include_fee}
              onChange={(isChecked) => {
                setTxInfo({ ...txInfo, is_include_fee: isChecked });
              }}
            />
          </div>
        )}
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
          disabled={isDisableNext}
          loading={isTxLoading}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default CreateTx;
