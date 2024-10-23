"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotSupportedScreen from "@/components/NotSupportedScreen";
import TestnetModeActivated from "@/components/TestnetModeActivated";
import Intro from "@/components/Intro";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectStorage } from "@/redux/features/storage/reducer";

import { isAddressEqual } from "@/utils/helpers";
import ConnectedRequired from "@/components/ConnectedRequired";
import useSupportedScreen from "@/hooks/useSupportedScreen";
import { reset, setNetwork } from "@/redux/features/storage/action";
import { setNetworkConfig } from "@/redux/features/app/action";
import { DEFAULT_NETWORK } from "@/configs/common";
import { CkbNetwork } from "@/types/common";

const defaultValue = {
  address: "",
};

const AppContext = createContext(defaultValue);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isShowIntro, setIsShowIntro] = useState<boolean>(true);
  const [address, setAddress] = useState<string>("");
  const { isSupported } = useSupportedScreen();

  const signer = ccc.useSigner();
  const { setClient } = ccc.useCcc();
  const { addressLogged, network } = useAppSelector(selectStorage);
  const dispatch = useAppDispatch();

  const checkIsLoggedIn = useCallback(async () => {
    const _getAddress = async () => {
      try {
        const [address] = await (
          window as any
        ).utxoGlobal.ckbSigner.getAccount();
        return address;
      } catch (e) {
        return "";
      }
    };
    const _address = await _getAddress();
    setAddress(_address);
  }, [signer]);

  useEffect(() => {
    AOS.init({
      duration: 700, // Duration of animation in milliseconds
    });
  }, []);

  useEffect(() => {
    setTimeout(() => setIsShowIntro(false), 1400);
  }, []);

  useEffect(() => {
    checkIsLoggedIn();
  }, [checkIsLoggedIn]);

  useEffect(() => {
    if (!address && !!addressLogged) {
      setAddress(addressLogged);
      return;
    }
    if (isAddressEqual(address, addressLogged)) return;
    dispatch(reset());
  }, [address, addressLogged, dispatch]);

  useEffect(() => {
    let _network = network;
    if (!network) {
      _network =
        DEFAULT_NETWORK === CkbNetwork.MiranaMainnet
          ? CkbNetwork.MiranaMainnet
          : CkbNetwork.PudgeTestnet;
    }

    dispatch(setNetwork(_network));
    dispatch(setNetworkConfig(_network));

    setClient(
      _network === CkbNetwork.MiranaMainnet
        ? new ccc.ClientPublicMainnet()
        : new ccc.ClientPublicTestnet()
    );
  }, [network, setClient]);

  useEffect(() => {
    let _network = network;
    if (!_network) {
      _network =
        DEFAULT_NETWORK === CkbNetwork.MiranaMainnet
          ? CkbNetwork.MiranaMainnet
          : CkbNetwork.PudgeTestnet;
    }

    dispatch(setNetwork(_network));
    dispatch(setNetworkConfig(_network));

    setClient(
      _network === CkbNetwork.MiranaMainnet
        ? new ccc.ClientPublicMainnet()
        : new ccc.ClientPublicTestnet()
    );
  }, [network, setClient]);

  if (!isSupported) return <NotSupportedScreen />;

  if (isShowIntro) return <Intro />;

  return (
    <AppContext.Provider value={{ address }}>
      <Header />
      {network === CkbNetwork.PudgeTestnet ? <TestnetModeActivated /> : null}

      {address ? children : <ConnectedRequired />}
      <Footer />
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
