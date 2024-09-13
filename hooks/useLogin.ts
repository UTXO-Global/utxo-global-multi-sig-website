"use client";

import { useCallback, useContext, useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import useAuthenticate from "./useAuthenticate";
import api from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  setAddressLogged,
  setToken,
  setTokenExpired,
} from "@/redux/features/storage/action";
import { selectApp } from "@/redux/features/app/reducer";
import { selectStorage } from "@/redux/features/storage/reducer";
import { AppContext } from "@/providers/app";

const useLogin = () => {
  const { isLoggedIn } = useAuthenticate();
  const signer = ccc.useSigner();
  const { config } = useAppSelector(selectApp);
  const { network, addressLogged } = useAppSelector(selectStorage);
  const { address } = useContext(AppContext);

  const dispatch = useAppDispatch();

  const _getNonce = useCallback(async (address: string) => {
    try {
      const { data } = await api.get(`/users/nonce/${address}`);
      return data.nonce;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const _signMessage = useCallback(
    async (nonce: string) => {
      try {
        const sig = await signer?.signMessage(`utxo.global login ${nonce}`);
        return sig?.signature;
      } catch (e) {
        console.error(e);
      }
    },
    [signer]
  );

  const _login = useCallback(
    async (signature: string, address: string) => {
      try {
        const { data } = await api.post("/users/login", {
          signature: signature.replace("0x", ""),
          address,
        });
        dispatch(setToken(data.token));
        dispatch(setTokenExpired(data.expired));
        dispatch(setAddressLogged(address));
      } catch (e) {
        console.error(e);
      }
    },
    [dispatch]
  );

  const login = useCallback(async () => {
    const currentNetwork = await (
      window as any
    ).utxoGlobal.ckbSigner.getNetwork();
    const isNetworkEqual = currentNetwork === config.network;
    if (!isNetworkEqual) {
      await (window as any).utxoGlobal.ckbSigner.switchNetwork(config.network);
      return login();
    }
    const address = (await signer?.getInternalAddress()) as string;
    if (isLoggedIn) return;
    const nonce = await _getNonce(address);
    const signature = (await _signMessage(nonce)) as string;
    if (signature) {
      await _login(signature, address);
    }
    return;
  }, [signer, isLoggedIn, _getNonce, _signMessage, _login]);

  useEffect(() => {
    if (signer && !!signer.getInternalAddress()) {
      login();
    }
  }, [login, signer, signer?.getInternalAddress()]);
};

export default useLogin;
