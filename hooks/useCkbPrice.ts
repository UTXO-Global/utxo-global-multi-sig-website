import { useEffect } from "react";
import { loadCkbPrice } from "@/redux/features/app/action";
import { useAppDispatch } from "@/redux/hook";

const useCkbPrice = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCkbPrice());
  }, []);
};

export default useCkbPrice;
