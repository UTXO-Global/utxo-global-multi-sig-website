export enum TransactionTab {
  Queue = "queue",
  History = "history",
}

export enum TransactionStatus {
  Sent = 1,
  WaitingSigned = 0,
}

export type TransactionType = {
  transaction_id: string;
  multi_sig_address: string;
  to_address: string;
  confirmed: string[];
  status: TransactionStatus;
  payload: string;
  created_at: number;
  amount: number;
};
