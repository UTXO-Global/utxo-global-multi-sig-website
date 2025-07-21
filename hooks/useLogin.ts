"use client";

import { useCallback, useContext, useEffect, useState } from "react";
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
import { toast } from "react-toastify";

const useLogin = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useAuthenticate();
  const signer = ccc.useSigner();
  const { disconnect } = ccc.useCcc();
  const { config } = useAppSelector(selectApp);

  const dispatch = useAppDispatch();

  const _getNonce = useCallback(
    async (address: string) => {
      try {
        const { data } = await api.get(`/users/nonce/${address}`);
        return data.nonce as string;
      } catch (e) {
        await signer?.disconnect();
        disconnect();
        toast.error("Unable to connect to the wallet. Please try again");
      }
      return undefined;
    },
    [disconnect]
  );

  const _signMessage = useCallback(
    async (nonce: string) => {
      try {
        const sig = await signer?.signMessage(`utxo.global login ${nonce}`);
        return sig?.signature;
      } catch (e) {
        disconnect()
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
        disconnect()
        console.error(e);
      }
    },
    [dispatch]
  );

  const login = useCallback(async () => {
    try {
      if (await signer?.isConnected()) {
        const address = (await signer?.getInternalAddress()) as string;
        if (isLoggedIn) return;

        const nonce = await _getNonce(address);
        if (!nonce) return;

        const signature = (await _signMessage(nonce)) as string;
        if (signature) {
          await _login(signature, address);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }

    return;
  }, [signer, isLoggedIn, _getNonce, _signMessage, _login, config.network]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (signer && !!signer.getInternalAddress() && mounted && !isLoggedIn) {
        login();
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [login, signer, signer?.getInternalAddress, mounted, isLoggedIn]);
};

export default useLogin;
