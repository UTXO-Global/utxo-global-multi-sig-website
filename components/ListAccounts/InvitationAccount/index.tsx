/* eslint-disable @next/next/no-img-element */
import Button from "@/components/Common/Button";
import { InviterType } from "@/types/account";

import { NETWORK } from "@/configs/common";
import { NETWORK_NAME } from "@/configs/network";
import useAcceptInvitation from "@/hooks/useAcceptInvitation";
import useRejectInvitation from "@/hooks/useRejectInvitation";

const InvitationAccount = ({
  account,
  refresh,
}: {
  account: InviterType;
  refresh: () => void;
}) => {
  const { isLoading: isAcceptLoading, accept } = useAcceptInvitation();
  const { isLoading: isRejectLoading, reject } = useRejectInvitation();

  return (
    <div className="px-4 py-3 rounded-lg border border-grey-300 hover:bg-grey-300 transition-colors flex justify-between items-center">
      <div className="flex gap-5 items-center">
        <div className="relative">
          <img
            src="/images/account.png"
            alt="account"
            className="w-[40px] rounded-full"
          />
          {/* TODO: threshold */}
          <div className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full text-[8px] text-light-100 font-medium flex justify-center items-center bg-orange-100">
            2/2
          </div>
        </div>

        <div>
          <p className="text-base font-medium text-dark-100">
            {account.account_name}
          </p>
          <div className="flex gap-1 items-center">
            <img
              src="/images/nervos.png"
              alt="nervos"
              className="w-4 rounded-full"
            />
            <p className="text-[12px] leading-[16px] text-dark-100">
              {NETWORK_NAME[NETWORK]}
            </p>
          </div>
        </div>
      </div>
      <div className="gap-4 flex items-center">
        <Button
          size="small"
          className="w-[100px]"
          disabled={isAcceptLoading}
          loading={isAcceptLoading}
          onClick={() => accept(account.multisig_address, refresh)}
        >
          Accept
        </Button>
        <Button
          size="small"
          className="w-[100px]"
          kind="danger-outline"
          disabled={isRejectLoading}
          loading={isRejectLoading}
          onClick={() => reject(account.multisig_address, refresh)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
export default InvitationAccount;
