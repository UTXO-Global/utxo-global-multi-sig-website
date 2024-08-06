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
  address: string;
  multisig_address: string;
  account_name: string;
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
  mutli_sig_witness_data: string;
  signers_detail?: SignerDetailType[];
  invites?: InviteType[];
};
