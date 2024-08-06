/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "antd";
import { toast } from "react-toastify";

import Button from "@/components/Common/Button";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnTimesCircle from "@/public/icons/icn-times-circle.svg";

import { isValidName, shortAddress } from "@/utils/helpers";
import { MultiSigAccountType } from "@/types/account";
import { NETWORK } from "@/configs/common";
import { NETWORK_NAME } from "@/configs/network";

import api from "@/utils/api";
import cn from "@/utils/cn";

const EditName = ({
  isModalOpen,
  setIsModalOpen,
  account,
  refresh,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  account: MultiSigAccountType;
  refresh: () => void;
}) => {
  const [nameVal, setNameVal] = useState<string>(account.name);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const editName = async () => {
    setIsSubmit(true);
    if (isError) return;
    setIsLoading(true);
    try {
      const { data } = await api.put("/multi-sig/accounts", {
        name: nameVal,
        multi_sig_address: account.multi_sig_address,
      });
      toast.success("Updated!");
      await refresh();
      handleOk();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onChaneNameVal = (e: any) => {
    setNameVal(e.target.value);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleReset = () => {
    setNameVal(account.name);
  };

  useEffect(() => {
    setIsError(!isValidName(nameVal));
  }, [nameVal]);

  return (
    <>
      <Modal
        open={isModalOpen}
        centered={true}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={500}
      >
        <div className="bg-light-100 rounded-[16px] p-6 pt-10">
          <h6 className="text-[20px] leading-[28px] text-dark-100 font-bold text-center">
            Edit Name
          </h6>
          <div
            className={cn(
              `p-4 bg-grey-300 rounded-lg flex gap-4 items-center mt-8`,
              {
                "border-error-100 border py-[14px]": isSubmit && isError,
              }
            )}
          >
            <input
              type="text"
              className="border-none outline-none bg-transparent flex-1 text-base placeholder:text-grey-400 text-dark-100"
              placeholder={account.name}
              onChange={onChaneNameVal}
              value={nameVal}
            />
            <IcnTimesCircle
              className="w-4 cursor-pointer"
              onClick={handleReset}
            />
          </div>
          {isSubmit && isError ? (
            <p className="text-sm text-error-100 mt-1">
              Account name can only contain letters, numbers, _ and must be
              between 4 and 16 characters.
            </p>
          ) : null}

          <div className="p-4 rounded-lg bg-grey-300 text-[16px] leading-[20px] text-dark-100 mt-4">
            {shortAddress(account.multi_sig_address, 14)}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Button
              kind="secondary"
              fullWidth
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={editName}
              disabled={(isSubmit && isError) || isLoading}
              loading={isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Account = ({
  account,
  refresh,
  isSmall,
  isActive,
}: {
  account: MultiSigAccountType;
  refresh: () => void;
  isSmall?: boolean;
  isActive?: boolean;
}) => {
  const [isShowEditName, setIsShowEditName] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <div
        className={cn(
          `cursor-pointer px-4 py-3 rounded-lg border border-grey-300 hover:bg-grey-300 transition-colors flex justify-between items-center group`,
          {
            "bg-grey-300": isActive,
          }
        )}
        onClick={() =>
          router.push(`/account/?address=${account.multi_sig_address}`)
        }
      >
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
              {account.name}
            </p>
            <p
              className={cn(`text-[14px] leading-[24px] text-grey-400`, {
                "text-[12px] leading-[16px]": isSmall,
              })}
            >
              <span className="text-dark-100">Pud: </span>
              {shortAddress(account.multi_sig_address, 5)}
            </p>
          </div>
        </div>
        <div className="gap-4 flex items-center">
          {isSmall ? null : (
            <Link
              href={`/account/?address=${account.multi_sig_address}`}
              className="bg-grey-200 rounded-lg px-2 py-1 group-hover:flex transition-all items-center gap-2 text-[12px] leading-[18px] text-grey-400 mr-[70px] hidden"
            >
              <span>Go to Dashboard</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M9.06638 12.4367C8.97274 12.3429 8.92015 12.2159 8.92015 12.0834C8.92015 11.9509 8.97274 11.8238 9.06638 11.73L12.3797 8.41668L2.75304 8.41668C2.62044 8.41668 2.49326 8.36401 2.39949 8.27024C2.30572 8.17647 2.25304 8.04929 2.25304 7.91668C2.25304 7.78408 2.30572 7.6569 2.39949 7.56313C2.49326 7.46936 2.62044 7.41668 2.75304 7.41668L12.3797 7.41668L9.06638 4.10335C9.00056 4.04224 8.95245 3.9645 8.9271 3.87834C8.90176 3.79217 8.90013 3.70076 8.92238 3.61375C8.94463 3.52673 8.98993 3.44733 9.05352 3.3839C9.11712 3.32047 9.19664 3.27537 9.28371 3.25335C9.37063 3.23115 9.46193 3.23274 9.54802 3.25795C9.63412 3.28317 9.71184 3.33109 9.77304 3.39668L13.9397 7.56335C14.0333 7.6571 14.0859 7.78418 14.0859 7.91668C14.0859 8.04919 14.0333 8.17627 13.9397 8.27002L9.77304 12.4367C9.67929 12.5303 9.55221 12.5829 9.41971 12.5829C9.28721 12.5829 9.16013 12.5303 9.06638 12.4367Z"
                  fill="#787575"
                />
              </svg>
            </Link>
          )}

          <div className="flex gap-2 items-center">
            <img
              src="/images/nervos.png"
              alt="nervos"
              className={cn(`w-6 rounded-full`, {
                "w-5": isSmall,
              })}
            />
            <p
              className={cn(
                `text-[14px] leading-[24px] font-medium text-dark-100`,
                {
                  hidden: isSmall,
                }
              )}
            >
              {NETWORK_NAME[NETWORK]}
            </p>
          </div>
          <IcnPencil
            className="w-4 fill-grey-400 hover:fill-dark-100 cursor-pointer"
            onClick={(e: any) => {
              setIsShowEditName(true);
              e.stopPropagation();
            }}
          />
        </div>
      </div>
      <EditName
        refresh={refresh}
        account={account}
        isModalOpen={isShowEditName}
        setIsModalOpen={(val) => setIsShowEditName(val)}
      />
    </>
  );
};
export default Account;
