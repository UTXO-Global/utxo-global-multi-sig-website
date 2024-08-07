import { useContext } from "react";
import { AppContext } from "@/providers/app";

const useAuthenticate = () => {
  const { isLoggedIn } = useContext(AppContext);

  return { isLoggedIn };
};

export default useAuthenticate;
