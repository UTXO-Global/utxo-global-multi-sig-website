import { UTXOSwapAPIKey } from "@/configs/common";
import { CkbNetwork } from "@/types/common";
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  CKB_TYPE_HASH,
  Client,
  Collector,
  DEFAULT_FEE_DENOMINATOR,
  Pool,
  PoolInfo,
  Token,
} from "@utxoswap/swap-sdk-js";

const getPriceFromCachhe = () => {
  try {
    const priceCache = localStorage.getItem("CKB_PRICE");
    if (!!priceCache) {
      const price = JSON.parse(priceCache);
      const expired = Number(price.expired) || 0;
      if (expired < new Date().getTime()) {
        return Number(price.priceUsd);
      }
    }
  } catch (e) {
    return undefined;
  }

  return undefined;
};

const getTokenRateFromCachhe = (typeHash: string) => {
  try {
    const dataCache = localStorage.getItem("TOKENS_RATES");
    if (!!dataCache) {
      const data = JSON.parse(dataCache);
      if (!!data && !!data[typeHash]) {
        const expired = Number(data[typeHash].expired) || 0;
        if (expired < new Date().getTime()) {
          return Number(data[typeHash].rateWithCKB);
        }
      }
    }
  } catch (e) {
    return undefined;
  }

  return undefined;
};

const updateTokenRateToCache = (typeHash: string, rate: number) => {
  try {
    const dataCache = localStorage.getItem("TOKENS_RATES");
    let data: any = {};
    if (!!dataCache) {
      data = { ...JSON.parse(dataCache) };
    }
    data[typeHash] = {
      expired: new Date().getTime() + 60000,
      rateWithCKB: rate,
    };

    localStorage.setItem("TOKENS_RATES", JSON.stringify(data));
  } catch (e) {
    return undefined;
  }

  return undefined;
};

export const loadCkbPriceFromCoinCap = createAsyncThunk(
  "app/load-ckb-price-from-coincap",
  async () => {
    try {
      const priceFromCache = getPriceFromCachhe();
      if (!!priceFromCache) {
        return priceFromCache;
      }

      const res = await fetch(
        `https://api.coincap.io/v2/assets/nervos-network`
      );
      const data = await res.json();
      localStorage.setItem(
        "CKB_PRICE",
        JSON.stringify({
          expired: new Date().getTime() + 60000,
          priceUsd: data.data.priceUsd,
        })
      );
      return data.data.priceUsd;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
);

export const loadCkbPrice = createAsyncThunk("app/load-ckb-price", async () => {
  try {
    const priceFromCache = getPriceFromCachhe();
    if (!!priceFromCache) {
      return priceFromCache;
    }

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=nervos-network&vs_currencies=usd`
    );

    const data = await res.json();
    localStorage.setItem(
      "CKB_PRICE",
      JSON.stringify({
        expired: new Date().getTime() + 60000,
        priceUsd: data["nervos-network"]?.usd || 0,
      })
    );
    return data["nervos-network"]?.usd || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
});

export const loadTokenRate = createAsyncThunk(
  "app/load-token-rate",
  async ({
    address,
    rpc,
    token,
  }: {
    address: string;
    rpc: string;
    token: { symbol: string; decimals: number; typeHash: string };
  }) => {
    try {
      const cacheData = getTokenRateFromCachhe(token.typeHash);
      if (!!cacheData) {
        return { [token.typeHash]: cacheData };
      }

      const collector = new Collector({ ckbIndexerUrl: rpc });
      const client = new Client(address.startsWith("ckb"), UTXOSwapAPIKey);

      const { list: pools } = await client.getPoolsByToken({
        pageNo: 0,
        pageSize: 1,
        searchKey: token.typeHash,
      });

      if (
        pools.length > 0 &&
        (pools[0].assetX.typeHash === token.typeHash ||
          pools[0].assetY.typeHash === token.typeHash)
      ) {
        const pool = new Pool({
          tokens: [
            {
              symbol: "CKB",
              decimals: 8,
              typeHash:
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            },
            {
              symbol: token.symbol,
              decimals: token.decimals,
              typeHash: token.typeHash,
            },
          ],
          ckbAddress: address,
          collector,
          client,
          poolInfo: pools[0],
        });
        const { output } =
          pool.calculateOutputAmountAndPriceImpactWithExactInput("1000");

        const rate = Number(output) / 1000;
        updateTokenRateToCache(token.typeHash, rate);
        return { [token.typeHash]: rate };
      }

      return {};
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
);

export const setNetworkConfig = createAction<CkbNetwork>(
  "app/set-network-config"
);
