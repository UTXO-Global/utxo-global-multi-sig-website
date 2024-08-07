"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ccc } from "@ckb-ccc/connector-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotSupportedScreen from "@/components/NotSupportedScreen";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";

import { isAddressEqual } from "@/utils/helpers";
import ConnectedRequired from "@/components/ConnectedRequired";
import useSupportedScreen from "@/hooks/useSupportedScreen";
import { reset } from "@/redux/features/storage/action";

const defaultValue = {
  address: "",
  isLoggedIn: false,
};

const AppContext = createContext(defaultValue);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isSupported } = useSupportedScreen();

  const { addressLogged, token } = useAppSelector(selectStorage);
  const dispatch = useAppDispatch();

  const signer = ccc.useSigner();

  const checkIsLoggedIn = useCallback(async () => {
    const _checkIsLoggedIn = async () => {
      if (!signer) return false;
      const address = await signer.getInternalAddress();
      setAddress(address);
      if (!address) return false;
      return !!token && isAddressEqual(address, addressLogged) ? true : false;
    };
    const _isLoggedIn = await _checkIsLoggedIn();
    if (_isLoggedIn) {
      setIsLoggedIn(true);
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
    }
  }, [addressLogged, signer, token]);

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
    <AppContext.Provider value={{ address, isLoggedIn }}>
      <Header />
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
