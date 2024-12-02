/* eslint-disable @next/next/no-img-element */
"use client";

import TextAvatar from "@/components/TextAvatar";
import useAssets from "@/hooks/useAssets";
import useMultisigBalance from "@/hooks/useMultisigBalance";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { loadTokenRate } from "@/redux/features/app/action";
import { selectApp } from "@/redux/features/app/reducer";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { formatNumber } from "@/utils/helpers";
import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useMemo } from "react";

const Assets = () => {
  const { info: account } = useAppSelector(selectAccountInfo);
  const { ckbPrice, tokenRates, config: appConfig } = useAppSelector(selectApp);
  const dispatch = useAppDispatch();
  const { assets, isLoading } = useAssets();
  const { balance } = useMultisigBalance();
  const multisigBalance = useMemo(() => {
    return Number(ccc.fixedPointToString(balance));
  }, [balance]);

  const tokens = useMemo(() => {
    if (Object.values(assets.udtBalances).length > 0) {
      return Object.values(assets.udtBalances).filter((udt) => udt.balance > 0);
    }
    return [];
  }, [assets]);

  const tokenPrices = useMemo(() => {
    let prices: { [key: string]: number } = {};
    if (tokens.length > 0) {
      tokens.forEach((t) => {
        const script = ccc.Script.from({
          codeHash: t.typeScript.code_hash,
          hashType: t.typeScript.hash_type,
          args: t.typeScript.args,
        });

        prices[t.typeScript.args] = 0;
        if (
          !!tokenRates[script.hash()] &&
          tokenRates[script.hash()] > 0 &&
          assets.udtBalances[script.hash()]
        ) {
          prices[t.typeScript.args] =
            (assets.udtBalances[script.hash()].balance /
              tokenRates[script.hash()]) *
            ckbPrice;
        }
      });
    }
    return prices;
  }, [tokenRates, tokens, ckbPrice, balance]);

  useEffect(() => {
    if (tokens.length > 0) {
      tokens.forEach((t) => {
        const script = ccc.Script.from({
          codeHash: t.typeScript.code_hash,
          hashType: t.typeScript.hash_type,
          args: t.typeScript.args,
        });

        dispatch(
          loadTokenRate({
            address: account?.multi_sig_address!,
            rpc: appConfig.ckbRPC,
            token: {
              symbol: t.symbol,
              decimals: t.decimal,
              typeHash: script.hash(),
            },
          })
        );
      });
    }
  }, [tokens, appConfig, account, assets]);

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-start">
        <div className="px-6 pt-3 pb-4 border-b-2 border-dark-100 text-[16px] leading-[20px] font-bold text-dark-100">
          Coins
        </div>
      </div>
      <div className="py-4 px-6">
        <div className="rounded-lg bg-light-100 overflow-hidden">
          <div className="text-[16px] leading-[40px] text-grey-400 font-medium px-6 py-2 border-b border-grey-300 flex">
            <div className="w-[60%]">Asset</div>
            <div className="w-[20%]">Balance</div>
            <div className="w-[20%] text-right">Value</div>
          </div>
          <div className="px-6 py-3">
            <div className="flex items-center">
              <div className="flex items-center w-[60%] justify-start">
                <img src="/images/nervos.png" alt="ckb" className="w-8" />
                <p className="text-[14px] leading-[24px] text-dark-100 font-medium ml-2">
                  CKB
                </p>
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%]">
                {account ? formatNumber(Number(multisigBalance)) : "--"} CKB
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%] text-right">
                ${account ? formatNumber(multisigBalance * ckbPrice) : 0}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-5">
              <div className="h-[16px] rounded-lg bg-grey-300 animate-pulse"></div>
            </div>
          ) : (
            tokens.map((udtBalance, index) => (
              <div key={index} className="px-6 py-3">
                <div className="flex items-center">
                  <div className="flex items-center w-[60%] justify-start">
                    {!!udtBalance.icon ? (
                      <img src={udtBalance.icon} alt="ckb" className="w-8" />
                    ) : (
                      <TextAvatar text={udtBalance.symbol} />
                    )}

                    <p className="text-[14px] leading-[24px] text-dark-100 font-medium ml-2">
                      {udtBalance.symbol}
                    </p>
                  </div>

                  <div className="text-base font-medium text-dark-100 w-[20%]">
                    {account ? formatNumber(Number(udtBalance.balance)) : "--"}{" "}
                    {udtBalance.symbol}
                  </div>
                  <div className="text-base font-medium text-dark-100 w-[20%] text-right">
                    $
                    {formatNumber(
                      tokenPrices[udtBalance.typeScript.args],
                      2,
                      8
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Assets;
