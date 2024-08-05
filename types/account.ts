export type SignerType = {
  name: string;
  address: string;
};

export type MultiSigAccountType = {
  multi_sig_address: string;
  threshold: number;
  signers: number;
  name: string;
  mutli_sig_witness_data: string;
};
