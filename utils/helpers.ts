import { toast } from "react-toastify";
import {
  addressToScript,
  scriptToAddress,
  AddressPrefix,
} from "@nervosnetwork/ckb-sdk-utils";

import { InviteStatus } from "@/types/account";
import { AddressBookType } from "@/types/address-book";

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
  maxPrecision = 2
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
    [InviteStatus.Pending]: "Waiting for accept",
    [InviteStatus.Accepted]: "Accepted",
    [InviteStatus.Rejected]: "Rejected",
  };
  return obj[status];
};

export const getAddressBookName = (
  address: string,
  addressBooks: AddressBookType[]
) => {
  const isOwner = addressBooks.some((z) =>
    isAddressEqual(z.user_address, address)
  );
  if (isOwner) return "Owner";
  const addressBook = addressBooks.find((z) =>
    isAddressEqual(z.signer_address, address)
  );
  return addressBook ? addressBook.signer_name : "--";
};
