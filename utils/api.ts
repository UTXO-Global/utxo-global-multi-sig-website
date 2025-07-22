import Axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { toast } from "react-toastify";
import { reset } from "@/redux/features/storage/action";
import { MAINNET_CONFIG, TESTNET_CONFIG } from "@/configs/network";
import { DEFAULT_NETWORK } from "@/configs/common";

interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders;
}

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

const getDefaultBaseURL = () => {
  try {
    let data = null;
    if (typeof window !== "undefined") {
      data = localStorage.getItem("persist:utxo-global-multi-sig");
    }

    let network = DEFAULT_NETWORK;
    if (!!data) {
      const config = JSON.parse(data);
      const storage = JSON.parse(config?.storage || "{}");
      if (!!storage.network) {
        network = storage.network;
      }
    }

    if (network === "nervos") {
      return MAINNET_CONFIG.apiURL;
    }
    return TESTNET_CONFIG.apiURL;
  } catch (e) {
    console.log("Get default network failed", e);
  }
};

let api = Axios.create({ baseURL: getDefaultBaseURL()! });

export const setBaseAPIURL = (baseURL: string) => {
  api.defaults.baseURL = baseURL;
};

api.interceptors.request.use(
  async (config) => {
    const token = store.getState().storage.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error): any => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error?.response;
    const status = response?.status;
    const handleAuthorization = () => {
      // toast("Unauthorization. Please login again!", {
      //   type: "error",
      //   autoClose: 3000,
      // });
      store.dispatch(reset());
    };
    switch (status) {
      case 401:
        handleAuthorization();
        break;
      default:
        toast(response.data, {
          type: "error",
          autoClose: 3000,
        });
        break;
    }
    return Promise.reject(error);
  }
);

export default api;
