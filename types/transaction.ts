export enum TransactionTab {
  Queue = "queue",
  InProgress = "in-progress",
  Cancelled = "cancelled",
  History = "history",
}

export enum TransactionStatus {
  WaitingSigned = 0,
  InProgress = 1,
  Commited = 2,
  Rejected = 3,
  Failed = 4,
  Cancelled = 5,
}

export type TransactionType = {
  transaction_id: string;
  multi_sig_address: string;
  to_address: string;
  confirmed: string[];
  rejected: string[];
  status: TransactionStatus;
  payload: string;
  updated_by: string;
  created_at: number;
  amount: number;
  errors?: { signer_address: string; error_msg: string }[];
};
