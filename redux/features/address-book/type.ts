import { AddressBookType } from "@/types/address-book";

export type AddressBookReducerType = {
  isLoading: boolean;
  data: AddressBookType[];
};

export const defaultAddressBookReducer: AddressBookReducerType = {
  isLoading: true,
  data: [],
};
