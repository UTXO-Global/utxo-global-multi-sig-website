import { useState } from "react";
import { toast } from "react-toastify";

import { sleep } from "@/utils/helpers";
import api from "@/utils/api";

const useAcceptInvitation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const accept = async (address: string, cb?: () => void) => {
    setIsLoading(true);
    try {
      const { data } = await api.put(`/multi-sig/invites/accept/${address}`);
      if (data.result) {
        await sleep(500);
        toast.success("Accepted!");
        cb?.();
      } else {
        toast.error("Accept failed!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    accept,
  };
};

export default useAcceptInvitation;
