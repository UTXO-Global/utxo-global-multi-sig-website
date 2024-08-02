import { toast } from "react-toastify";

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

export const formatNumber = (number: number, minPrecision = 2, maxPrecision = 2) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}
