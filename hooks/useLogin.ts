"use client";

import { useCallback, useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import useAuthenticate from "./useAuthenticate";
import api from "@/utils/api";
import { useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";
import { AddressPrefix, CkbNetwork } from "@/types/common";

const useLogin = () => {
  const { isLoggedIn } = useAuthenticate();
  const { client } = ccc.useCcc();
  const signer = ccc.useSigner();

  const { network } = useAppSelector(selectStorage);

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
        const sig = await signer?.signMessage(nonce);
        console.log(sig);
        return sig?.signature;
      } catch (e) {
        console.error(e);
      }
    },
    [signer]
  );

  const _login = useCallback(async (signature: string, address: string) => {
    try {
      const { data } = await api.post("/users/login", {
        signature,
        address,
      });
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const login = useCallback(async () => {
    if (!signer) return;
    const address = (await signer?.getInternalAddress()) as string;
    const nonce = await _getNonce(address);
    const signature = (await _signMessage(nonce)) as string;
    // await _login(signature, address);
  }, [signer, _getNonce, _signMessage, _login]);


  const switchNetwork = useCallback(async () => {
    if (!signer) return
    const currentNetwork = await (window as any).utxoGlobal.getNetwork();
    const isNetworkEqual = currentNetwork === network;
    if (!isNetworkEqual) {
      await (window as any).utxoGlobal.switchNetwork(network);
      return;
    }
  }, [network, signer]);

  // useEffect(() => {
  //   switchNetwork()
  // }, [switchNetwork]);

  // useEffect(() => {
  //   if (isLoggedIn) return;
  //   login();
  // }, [isLoggedIn, login]);
};

export default useLogin;
