import {
  Action,
  configureStore,
  ThunkAction,
  combineReducers,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import appReducer from "./features/app/reducer";
import storageReducer from "./features/storage/reducer";
import accountInfoReducer from "./features/account-info/reducer";
import addressBookReducer from "./features/address-book/reducer";
import transactionsReducer from "./features/transactions/reducer";
import assetReducer from "./features/assets/reducer";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, _value: any) {
      return Promise.resolve();
    },
    removeItem(_key: String) {
      return Promise.resolve();
    },
  };
};

const storageCustom =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "utxo-global-multi-sig",
  migrate: (state: any) => Promise.resolve(state),
  stateReconciler: autoMergeLevel2 as any,
  storage: storageCustom,
  whitelist: ["storage"],
};

const rootReducer = combineReducers({
  app: appReducer,
  storage: storageReducer,
  accountInfo: accountInfoReducer,
  addressBook: addressBookReducer,
  transactions: transactionsReducer,
  asset: assetReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const createStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export let store = createStore();

export const persistor = persistStore(store);

export const refreshStore = () => {
  store = createStore();
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type StoreType = typeof store;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
