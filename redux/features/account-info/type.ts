import { MultiSigAccountType } from "@/types/account";

export type AccountInfoReducerType = {
  isInfoLoading: boolean;
  info: MultiSigAccountType | undefined;
};

export const defaultAccountInfoReducer: AccountInfoReducerType = {
  isInfoLoading: true,
  info: undefined,
};
