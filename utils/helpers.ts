import { toast } from "react-toastify";
import Decimal from "decimal.js";
import { AddressPrefix } from "@nervosnetwork/ckb-sdk-utils";
import { helpers } from "@ckb-lumos/lumos";

import { InviteStatus, SignerDetailType } from "@/types/account";
import { AddressBookType } from "@/types/address-book";
import { NETWORK } from "@/configs/common";

import { ccc } from "@ckb-ccc/connector-react";
import { AGGRON4, LINA } from "./lumos-config";

export const comingSoonMsg = () => {
  toast.info("Coming Soon!");
};

export const isAddressEqual = (address01: string, address02: string) =>
  address01.trim().toLowerCase() === address02.trim().toLowerCase();

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function shortAddress(address?: string, len = 5) {
  if (!address) return "";
  if (address.length <= len * 2) return address;
  return address.slice(0, len) + "..." + address.slice(address.length - len);
}

export const formatNumber = (
  number: number,
  minPrecision = 2,
  maxPrecision = 8
) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  };
  return number.toLocaleString(undefined, options);
};

export const copy = (value: string) => {
  navigator.clipboard.writeText(value);
  toast.success("Copied");
};

export const isValidCKBAddress = (address: string, network: string) => {
  if (address.length < 97) return true;
  const lumosConfig = network === "nervos" ? LINA : AGGRON4;

  const toScript = helpers.parseAddress(address, {
    config: lumosConfig,
  });

  if (ccc.bytesFrom(toScript.args).length > 20) return false;

  try {
    // const script = addressToScript(address);
    // const reconstructedAddress = scriptToAddress(script);
    // const isAddressValid = address === reconstructedAddress;
    const isCorrectPrefix = address.startsWith(
      network === "nervos" ? AddressPrefix.Mainnet : AddressPrefix.Testnet
    );
    return true && isCorrectPrefix;
  } catch (error) {
    return false;
  }
};

export const isValidName = (name: string) => {
  const regex = /^[a-zA-Z0-9\_]{4,16}$/;
  return regex.test(name);
};

export const inviteStatus = (status: InviteStatus) => {
  const obj = {
    [InviteStatus.Pending]: "Waiting for approval",
    [InviteStatus.Accepted]: "Accepted",
    [InviteStatus.Rejected]: "Rejected",
  };
  return obj[status];
};

export const getAddressBookName = (
  address: string,
  addressBooks: AddressBookType[],
  currentAddress: string
) => {
  if (isAddressEqual(currentAddress, address)) return "You";
  const addressBook = addressBooks.find((z) =>
    isAddressEqual(z.signer_address, address)
  );
  return addressBook ? addressBook.signer_name : "--";
};

export const getBalance = async (address: string) => {
  try {
    const network = NETWORK === "nervos" ? "mainnet" : "testnet";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/ckb/${network}/v1/addresses/${address}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      }
    );
    const data = await res.json();
    const balance = new Decimal(data.data[0].attributes.balance).div(10 ** 8);

    return balance.toNumber();
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const camelToSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
