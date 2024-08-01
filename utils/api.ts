import Axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { toast } from "react-toastify";
import { reset } from "@/redux/features/storage/action";

interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders;
}

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

const api = Axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use(
  (config): AdaptAxiosRequestConfig => {
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
    console.log(error)
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
