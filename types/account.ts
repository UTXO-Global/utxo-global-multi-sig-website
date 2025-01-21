import { UdtBalanceType } from "@/redux/features/assets/type";
import { ccc } from "@ckb-ccc/connector-react";
import { BI } from "@ckb-lumos/lumos";

export type SignerType = {
  name: string;
  address: string;
};

export type SignerDetailType = {
  multi_sig_address: string;
  signer_address: string;
};

export enum InviteStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export type InviterType = {
  account_name: string;
  address: string;
  multisig_address: string;
  signers: number;
  threshold: number;
};

export type InviteType = {
  signer_address: string;
  multi_sig_address: string;
  status: InviteStatus;
};

export type MultiSigAccountType = {
  multi_sig_address: string;
  threshold: number;
  signers: number;
  name: string;
  multi_sig_witness_data: string;
  signers_detail?: SignerDetailType[];
  invites?: InviteType[];
  balance: number;
  totalTxPending: number;
};

export type SendTokenType = {
  send_from: string;
  send_to: string;
  amount: number;
  network: string;
  is_include_fee: boolean;
  token?: UdtBalanceType & { typeHash: string };
  fee?: Number;
  feeRate: Number;
  isUseDID?: boolean;
};

export type BatchTransferType = {
  from: string;
  tos: { address: string; amount: number }[];
  network: string;
  is_include_fee: boolean;
  amount?: number;
  fee?: number;
  feeRate: number;
  token?: UdtBalanceType & { typeHash: string };
};

export type TransactionType = {
  transaction_id: string;
  payload: string;
};

export type CreateTransactionRes = {
  transaction?: ccc.Transaction;
  fee?: BI | undefined;
  error?: string;
};
