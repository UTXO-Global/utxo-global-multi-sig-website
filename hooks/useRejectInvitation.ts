import { useState } from "react";
import { toast } from "react-toastify";

import api from "@/utils/api";

const useRejectInvitation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reject = async (address: string, cb?: () => void) => {
    setIsLoading(true);
    try {
      const { data } = await api.put(`/multi-sig/invites/reject/${address}`);
      if (data.result) {
        toast.success("Rejected!");
        cb?.();
      } else {
        toast.error("Reject failed!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    reject,
  };
};

export default useRejectInvitation;
