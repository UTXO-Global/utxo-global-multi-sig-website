import { InviterType } from "@/types/account";
import { useEffect, useState } from "react";

import api from "@/utils/api";
import useAuthenticate from "./useAuthenticate";

const useInvitation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [invites, setInvites] = useState<InviterType[]>([]);

  const { isLoggedIn } = useAuthenticate();

  const load = async () => {
    try {
      const { data } = await api.get("/multi-sig/invites");
      setInvites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    load();
  }, [isLoggedIn]);

  return {
    isLoading,
    invites,
    load,
  };
};

export default useInvitation;
