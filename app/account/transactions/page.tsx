"use client";

import { useState } from "react";

import cn from "@/utils/cn";

import Transaction from "@/components/Transaction";

const Transactions = () => {
  const [tab, setTab] = useState<string>("queue");

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-start">
        <div
          className={cn(
            `px-6 pt-3 pb-4 border-b-2 border-transparent text-[16px] leading-[20px] font-medium text-grey-400 cursor-pointer`,
            {
              "border-dark-100 font-bold text-dark-100": tab === "queue",
            }
          )}
          onClick={() => setTab("queue")}
        >
          Queue
        </div>
        <div
          className={cn(
            `px-6 pt-3 pb-4 border-b-2 border-transparent text-[16px] leading-[20px] font-medium text-grey-400 cursor-pointer`,
            {
              "border-dark-100 font-bold text-dark-100": tab === "history",
            }
          )}
          onClick={() => setTab("history")}
        >
          History
        </div>
      </div>
      <div className="py-4 px-6 grid gap-2">
        <p className="text-[16px] leading-[20px] font-medium text-grey-400">
          Next
        </p>
        {tab === "queue" ? (
          <>
            <Transaction
              status="pending"
              isConfirm={true}
              transaction={{
                transaction_id:
                  "d6d42d1282b2093d0c0ad174f54962a4f53fa3be305109e5f2978546f419e863",
                payload: `{"version":"0x0","cell_deps":[{"out_point":{"index":"0x1","tx_hash":"0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37"},"dep_type":"dep_group"}],"header_deps":[],"inputs":[{"previous_output":{"index":"0x0","tx_hash":"0x77f75e71906d27ea9e311b9459c0bbdf2f9d08f11533fce604b5aee664a2f9a8"},"since":"0x0"}],"outputs":[{"capacity":"0x3e8","lock":{"code_hash":"0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8","hash_type":"type","args":"0x1349de80ed56fb0d70450b3d4fd46bd0d6c4bfb6"}},{"capacity":"0x9184e729c18","lock":{"code_hash":"0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8","hash_type":"type","args":"0x4fcf0ae9f2970ebed1b03cd14665da038baee8c4"}}],"outputs_data":["0x","0x"],"witnesses":["0xd600000010000000d6000000d6000000c200000000000203aa7e242fbe9d7b9ee914bf80b6d1266de81b81f02fba34dee2650280b4314bf560d4e3cb2db31116f9d9e95aa5bd8dbf74926e395bec2e5b05f33dfc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"],"hash":"0xd6d42d1282b2093d0c0ad174f54962a4f53fa3be305109e5f2978546f419e863"}`,
              }}
            />
            <Transaction
              status="pending"
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              isConfirm={true}
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              isConfirm={true}
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              isConfirm={true}
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              isConfirm={true}
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="pending"
              transaction={{ transaction_id: "", payload: "" }}
            />
          </>
        ) : (
          <>
            <Transaction
              status="success"
              transaction={{ transaction_id: "", payload: "" }}
            />
            <Transaction
              status="unsuccess"
              transaction={{ transaction_id: "", payload: "" }}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default Transactions;
