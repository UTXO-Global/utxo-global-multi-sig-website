/* eslint-disable @next/next/no-img-element */
import Button from "@/components/Common/Button";
import { InviterType } from "@/types/account";

import { NETWORK } from "@/configs/common";
import { NETWORK_NAME } from "@/configs/network";
import useAcceptInvitation from "@/hooks/useAcceptInvitation";
import useRejectInvitation from "@/hooks/useRejectInvitation";

import cn from "@/utils/cn";

const InvitationAccount = ({
  account,
  refresh,
  isSmall,
}: {
  account: InviterType;
  refresh: () => void;
  isSmall?: boolean;
}) => {
  const { isLoading: isAcceptLoading, accept } = useAcceptInvitation();
  const { isLoading: isRejectLoading, reject } = useRejectInvitation();

  return (
    <div className="px-4 py-3 rounded-lg border border-grey-300 hover:bg-grey-300 transition-colors flex justify-between items-center">
      <div
        className={cn(`flex gap-5 items-center`, {
          "gap-2": isSmall,
        })}
      >
        <div className="relative">
          <img
            src="/images/account.png"
            alt="account"
            className={cn(`w-[40px] rounded-full`, {
              "w-8": isSmall,
            })}
          />
          <div
            className={cn(
              `absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full text-[8px] text-dark-100 font-medium flex justify-center items-center bg-[#FFD5B3]`,
              {
                "w-[14px] h-[14px] text-[6px]": isSmall,
              }
            )}
          >
            {account.threshold}/{account.signers}
          </div>
        </div>

        <div>
          <p
            className={cn(`text-base font-medium text-dark-100`, {
              "text-[14px] leading-[20px]": isSmall,
            })}
          >
            {account.account_name}
          </p>
          <div className="flex gap-1 items-center">
            <img
              src="/images/nervos.png"
              alt="nervos"
              className={cn(`w-4 rounded-full`, {
                "w-3": isSmall,
              })}
            />
            <p
              className={cn(`text-[12px] leading-[16px] text-dark-100`, {
                "text-[10px]": isSmall,
              })}
            >
              {NETWORK_NAME[NETWORK]}
            </p>
          </div>
        </div>
      </div>
      <div
        className={cn(`gap-4 flex items-center`, {
          "gap-2": isSmall,
        })}
      >
        <Button
          size="small"
          className={cn(`w-[100px]`, {
            "w-[60px] !px-2 !py-[3px] !text-[12px]": isSmall,
          })}
          disabled={isAcceptLoading}
          loading={isAcceptLoading}
          onClick={() => accept(account.multisig_address, refresh)}
        >
          Accept
        </Button>
        {/* <Button
          size="small"
          className={cn(`w-[100px]`, {
            "w-[60px] !px-2 !py-[3px] !text-[12px]": isSmall,
          })}
          kind="danger-outline"
          disabled={isRejectLoading}
          loading={isRejectLoading}
          onClick={() => reject(account.multisig_address, refresh)}
        >
          Remove
        </Button> */}
      </div>
    </div>
  );
};
export default InvitationAccount;
