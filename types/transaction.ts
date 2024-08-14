export enum TransactionTab {
  Queue = "queue",
  History = "history",
}

export enum TransactionStatus {
  WaitingSigned = 0,
  Sent = 1,
  Rejected = 2,
  Failed = 3,
}

export type TransactionType = {
  transaction_id: string;
  multi_sig_address: string;
  to_address: string;
  confirmed: string[];
  rejected: string[];
  status: TransactionStatus;
  payload: string;
  created_at: number;
  amount: number;
  errors?: { signer_address: string; error_msg: string }[];
};
