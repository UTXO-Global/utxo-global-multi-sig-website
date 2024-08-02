"use client";

import { useCallback, useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import useAuthenticate from "./useAuthenticate";
import api from "@/utils/api";
import { useAppDispatch } from "@/redux/hook";
import {
  setAddressLogged,
  setToken,
  setTokenExpired,
} from "@/redux/features/storage/action";
import { NETWORK } from "@/configs/common";

const useLogin = () => {
  const { isLoggedIn } = useAuthenticate();
  const signer = ccc.useSigner();
  const { client } = ccc.useCcc();

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
    if (!signer) return;
    const currentNetwork = await (window as any).utxoGlobal.getNetwork();
    const isNetworkEqual = currentNetwork === NETWORK;
    if (!isNetworkEqual) {
      await (window as any).utxoGlobal.switchNetwork(NETWORK);
      return login()
    }
    const address = (await signer?.getInternalAddress()) as string;
    if (isLoggedIn) return;
    const nonce = await _getNonce(address);
    const signature = (await _signMessage(nonce)) as string;
    await _login(signature, address);
    return
  }, [isLoggedIn, signer, _getNonce, _signMessage, _login]);

  useEffect(() => {
    login();
  }, [login]);
};

export default useLogin;
