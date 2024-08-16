export type TransactionsReducerType = {
  isLoading: boolean;
  data: any[]
};

export const defaultTransactionsReducer: TransactionsReducerType = {
  isLoading: true,
  data: []
};
