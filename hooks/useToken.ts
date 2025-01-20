import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectAccountInfo } from "@/redux/features/account-info/reducer";
import { selectStorage } from "@/redux/features/storage/reducer";
import { selectApp } from "@/redux/features/app/reducer";
import { setTokens } from "@/redux/features/storage/action";

const useTokens = () => {
  const dispatch = useAppDispatch();
  const { info: account } = useAppSelector(selectAccountInfo);
  const { config: appConfig } = useAppSelector(selectApp);
  const { tokens } = useAppSelector(selectStorage);

  const getToken = async (args: string) => {
    try {
      if (!!tokens[args]) {
        return tokens[args];
      }

      const res = await fetch(
        `${appConfig.apiURL}/ckb/${
          appConfig.network === "nervos" ? "mainnet" : "testnet"
        }/v1/xudts/${args}`,
        {
          headers: {
            "content-type": "application/vnd.api+json",
            accept: "application/vnd.api+json",
          },
        }
      );

      const { data } = await res.json();
      const tokenInfo = {
        name: data.attributes.full_name,
        symbol: data.attributes.symbol,
        decimal: Number(data.attributes.decimal),
      };

      dispatch(setTokens({ [args]: tokenInfo }));
      return tokenInfo;
    } catch (e) {}
  };

  return { getToken };
};

export default useTokens;
