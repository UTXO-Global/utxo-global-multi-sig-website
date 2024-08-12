"use client";

import { useContext, useMemo, useState } from "react";
import { formatDistanceStrict, format } from "date-fns";

import Button from "../Common/Button";
import IcnSend from "@/public/icons/icn-send.svg";
import IcnChevron from "@/public/icons/icn-chevron.svg";
import IcnChecked from "@/public/icons/icn-checked.svg";
import IcnUserGroup from "@/public/icons/icn-user-group.svg";

import cn from "@/utils/cn";
import { TransactionStatus, TransactionType } from "@/types/transaction";
import { formatNumber, isAddressEqual, shortAddress } from "@/utils/helpers";
import { MultiSigAccountType } from "@/types/account";
import { AppContext } from "@/providers/app";
import { ccc } from "@ckb-ccc/connector-react";
import { cccA } from "@ckb-ccc/connector-react/advanced";
import api from "@/utils/api";
import { toast } from "react-toastify";

const STATUS_TEXT = {
  [TransactionStatus.Sent]: "Success",
  [TransactionStatus.WaitingSigned]: "Pending",
};

const Transaction = ({
  transaction,
  accountInfo,
}: {
  transaction: TransactionType;
  accountInfo: MultiSigAccountType;
}) => {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState<boolean>(false);
  const { address } = useContext(AppContext);
  const signer = ccc.useSigner();

  const statusTxt = useMemo(() => {
    if (!transaction) return STATUS_TEXT[TransactionStatus.WaitingSigned];
    return STATUS_TEXT[transaction.status];
  }, [transaction]);

  const isConfirmed = useMemo(() => {
    return transaction?.confirmed.some((z) => isAddressEqual(z, address));
  }, [address, transaction]);

  const confirm = async () => {
    setIsConfirmLoading(false);
    try {
      if (!signer) return;
      const jsonTx = JSON.parse(transaction.payload) as cccA.JsonRpcTransaction;
      const rawTx = cccA.JsonRpcTransformers.transactionTo(jsonTx);
      await Promise.all([
        rawTx.inputs.forEach(async (input, idx) => {
          const cellInput = await signer.client.getCell({
            txHash: input.previousOutput.txHash,
            index: input.previousOutput.index,
          });

          rawTx.inputs[idx].cellOutput = cellInput?.cellOutput;
        }),
      ]);

      const signature = await signer.signOnlyTransaction(rawTx);

      const witnesses = signature.witnesses.toString();
      const { data } = await api.post("/multi-sig/signature", {
        txid: transaction.transaction_id,
        signature: witnesses.slice(42),
      });

      if (data && !!data.transaction_id) {
        toast.success("Transaction has signed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-light-100 overflow-hidden">
      <div
        className={cn(
          `px-4 py-[18px] flex items-center cursor-pointer hover:bg-grey-200 transition-colors`,
          {
            "py-[14px]": !isConfirmed,
          }
        )}
        onClick={() => setIsShow(!isShow)}
      >
        <div className="flex gap-2 items-center w-[30%] pr-2">
          <IcnSend className="w-4" />
          <p className="text-[16px] leading-[20px] font-medium text-dark-100">
            Send
          </p>
        </div>
        <div className="w-[30%] text-[16px] leading-[20px] font-medium text-grey-400 grid grid-cols-2 gap-4 pl-2">
          <p>-{formatNumber(transaction.amount)} CKB</p>
          <p>
            {formatDistanceStrict(new Date(transaction.created_at), new Date())}
          </p>
        </div>
        <div className="w-[40%] flex items-center gap-3 pl-4">
          <div className="flex justify-between flex-1">
            <div className="flex gap-1 items-center">
              {transaction.status === TransactionStatus.Sent ? (
                <div className="w-6 aspect-square p-[2px]">
                  <IcnChecked className="fill-success-100 w-full" />
                </div>
              ) : transaction.status === TransactionStatus.WaitingSigned ? (
                <IcnUserGroup className="w-6" />
              ) : null}

              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100`,
                  {
                    "text-success-200":
                      transaction.status === TransactionStatus.Sent,
                    "text-error-100": false,
                  }
                )}
              >
                {`${transaction.confirmed.length} out of ${accountInfo.signers}`}
              </p>
            </div>
            {!isConfirmed ? (
              <Button size="small" kind="secondary" className="!py-[5px]">
                Confirm
              </Button>
            ) : (
              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100 capitalize`,
                  {
                    "text-success-200":
                      transaction.status === TransactionStatus.Sent,
                    "text-error-100": false,
                    "mr-[9px]":
                      transaction.status === TransactionStatus.WaitingSigned,
                  }
                )}
              >
                {statusTxt}
              </p>
            )}
          </div>

          <IcnChevron
            className={cn(`w-4 transition-all`, {
              "rotate-180": isShow,
            })}
          />
        </div>
      </div>
      <div
        className={cn(
          `border-grey-300 flex transition-all max-h-0 overflow-hidden relative`,
          {
            "max-h-[400px] border-t": isShow,
          }
        )}
      >
        <div className="w-[60%] px-4 py-6 grid gap-2 border-r border-grey-300 content-start sticky top-0">
          <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
            <p className="w-[90px] font-medium">To Address:</p>
            <p>{shortAddress(transaction.to_address, 14)}</p>
          </div>
          <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
            <p className="w-[90px] font-medium">Created:</p>
            <p>
              {format(
                new Date(transaction.created_at),
                "MMM d, yyyy hh:mm:ss a"
              )}
            </p>
          </div>
          {transaction.status === TransactionStatus.WaitingSigned ? (
            <p className="text-[16px] leading-[20px] font-medium text-orange-100">
              Number of confirmations required: {accountInfo.threshold}
            </p>
          ) : null}
        </div>
        <div className="w-[40%] p-4">
          <div
            className={cn(
              `text-[16px] leading-[20px] grid gap-6 relative transition-all max-h-[calc(100%-64px)] overflow-auto`,
              {
                "max-h-full":
                  transaction.status !== TransactionStatus.WaitingSigned,
              }
            )}
          >
            <div className="w-[2px] h-full bg-grey-300 absolute top-0 left-[7px]"></div>
            <div className="flex gap-2 items-center bg-light-100 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                  fill="#0D0D0D"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 7H11C11.5523 7 12 7.44772 12 8C12 8.55228 11.5523 9 11 9H9V11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11V9H5C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7H7V5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5V7Z"
                  fill="white"
                />
              </svg>
              <p className="font-medium text-dark-100">Created</p>
            </div>
            <div className="relative">
              <div className="flex gap-2 items-center bg-light-100">
                {transaction.status === TransactionStatus.Sent ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                      fill="#0D0D0D"
                    />
                    <path
                      d="M7.68894 8.54156L6.18321 7.13278C5.77992 6.75545 5.14711 6.7765 4.76978 7.17979C4.39245 7.58308 4.4135 8.2159 4.8168 8.59322L7.0378 10.6712C7.4352 11.043 8.05698 11.0288 8.43694 10.6392L11.3049 7.69817C11.6905 7.30277 11.6826 6.66965 11.2872 6.28406C10.8918 5.89848 10.2587 5.90643 9.87307 6.30183L7.68894 8.54156Z"
                      fill="white"
                    />
                  </svg>
                ) : transaction.status === TransactionStatus.WaitingSigned ? (
                  <div className="border border-grey-500 rounded-full w-4 aspect-square"></div>
                ) : null}

                <p className="font-medium text-dark-100">
                  Confirmed{" "}
                  <span className="text-grey-400">
                    {`(${transaction.confirmed.length} of ${accountInfo.threshold})`}
                  </span>
                </p>
              </div>
              <div className="grid gap-4 mt-5">
                {transaction.confirmed.map((z, i) => (
                  <div
                    key={`confirmed-${i}`}
                    className="flex gap-2 items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M8 11C9.65686 11 11 9.65686 11 8C11 6.34315 9.65686 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65686 6.34315 11 8 11Z"
                        fill="#0D0D0D"
                      />
                    </svg>
                    <div className="flex gap-2">
                      <p className="text-success-200 font-normal text-[14px]">
                        {shortAddress(z, 14)}
                      </p>
                      <div className="px-1 py-[2px] bg-[#E0FBF2] rounded-[4px] text-[10px] leading-[16px] text-success-200">
                        Confirmed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {transaction.status === TransactionStatus.Sent ? (
              <div className="flex gap-2 items-center bg-light-100 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                    fill="#0D0D0D"
                  />
                  <path
                    d="M7.68894 8.54156L6.18321 7.13278C5.77992 6.75545 5.14711 6.7765 4.76978 7.17979C4.39245 7.58308 4.4135 8.2159 4.8168 8.59322L7.0378 10.6712C7.4352 11.043 8.05698 11.0288 8.43694 10.6392L11.3049 7.69817C11.6905 7.30277 11.6826 6.66965 11.2872 6.28406C10.8918 5.89848 10.2587 5.90643 9.87307 6.30183L7.68894 8.54156Z"
                    fill="white"
                  />
                </svg>
                <p className="font-medium text-dark-100">Completed</p>
              </div>
            ) : transaction.status === TransactionStatus.WaitingSigned ? (
              <div className="flex gap-2 items-center bg-light-100 relative">
                <div className="border border-grey-500 rounded-full w-4 aspect-square"></div>
                <p className="font-medium text-grey-400">Completed</p>
              </div>
            ) : null}
          </div>
          {transaction.status === TransactionStatus.WaitingSigned ? (
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button
                fullWidth
                size="small"
                disabled={isConfirmed || isConfirmLoading}
                loading={isConfirmLoading}
                onClick={confirm}
              >
                Confirm
              </Button>
              {/* <Button fullWidth size="small" kind="danger-outline">
                Reject
              </Button> */}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
