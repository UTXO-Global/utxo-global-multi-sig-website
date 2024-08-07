"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotSupportedScreen from "@/components/NotSupportedScreen";
import TestnetModeActivated from "@/components/TestnetModeActivated";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";

import { isAddressEqual } from "@/utils/helpers";
import ConnectedRequired from "@/components/ConnectedRequired";
import useSupportedScreen from "@/hooks/useSupportedScreen";
import { reset } from "@/redux/features/storage/action";

const defaultValue = {
  address: "",
};

const AppContext = createContext(defaultValue);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string>("");
  const { isSupported } = useSupportedScreen();

  const { addressLogged } = useAppSelector(selectStorage);
  const dispatch = useAppDispatch();

  const signer = ccc.useSigner();

  const checkIsLoggedIn = useCallback(async () => {
    const _getAddress = async () => {
      try {
        if (!signer) return "";
        const address = await signer.getInternalAddress();
        return address;
      } catch (e) {
        return "";
      }
    };
    const _address = await _getAddress();
    setAddress(_address);
  }, [signer]);

  useEffect(() => {
    checkIsLoggedIn();
  }, [checkIsLoggedIn]);

  useEffect(() => {
    if (!address) return;
    if (isAddressEqual(address, addressLogged)) return;
    dispatch(reset());
  }, [address, addressLogged, dispatch]);

  if (!isSupported) return <NotSupportedScreen />;

  return (
    <AppContext.Provider value={{ address }}>
      <Header />
      <TestnetModeActivated />
      {!signer ? (
        <>
          <ConnectedRequired />
        </>
      ) : address ? (
        children
      ) : null}
      <Footer />
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
