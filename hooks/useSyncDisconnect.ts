import { useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from "next/navigation";
import { reset } from "@/redux/features/storage/action";
import { reset as restAccountInfo } from "@/redux/features/account-info/action";
import { useAppDispatch } from "@/redux/hook";

const useSyncDisconnect = () => {
  const signer = ccc.useSigner();
  const { disconnect } = ccc.useCcc();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("UTXO_GLOBAL_MULTISIG");
      channel.onmessage = (event) => {
        if (event.data?.event === "disconnect") {
          disconnect();
          dispatch(reset());
          dispatch(restAccountInfo());
          router.push("/");
        }
      };
    }
  }, [disconnect]);
};

export default useSyncDisconnect;
