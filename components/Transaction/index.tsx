"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import Link from "next/link";
import { formatDistanceStrict, format } from "date-fns";

import Button from "../Common/Button";
import IcnSend from "@/public/icons/icn-send.svg";
import IcnChevron from "@/public/icons/icn-chevron.svg";
import IcnChecked from "@/public/icons/icn-checked.svg";
import IcnUserGroup from "@/public/icons/icn-user-group.svg";
import IcnExternalLink from "@/public/icons/icn-external-link.svg";

import cn from "@/utils/cn";
import { TransactionStatus, TransactionType } from "@/types/transaction";
import { formatNumber, isAddressEqual, shortAddress } from "@/utils/helpers";
import { MultiSigAccountType } from "@/types/account";
import { AppContext } from "@/providers/app";
import { ccc } from "@ckb-ccc/connector-react";
import { cccA } from "@ckb-ccc/connector-react/advanced";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadInfo } from "@/redux/features/account-info/action";
import { useSearchParams } from "next/navigation";
import { selectApp } from "@/redux/features/app/reducer";
import { BI } from "@ckb-lumos/lumos";
import useTokens from "@/hooks/useToken";

const STATUS_TEXT = {
  [TransactionStatus.WaitingSigned]: "Pending",
  [TransactionStatus.Sent]: "Success",
  [TransactionStatus.Rejected]: "Rejected",
  [TransactionStatus.Failed]: "Unsuccess",
};

const Transaction = ({
  transaction,
  accountInfo,
  refresh,
}: {
  transaction: TransactionType;
  accountInfo: MultiSigAccountType;
  refresh?: () => void;
}) => {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState<boolean>(false);
  const [isRejectLoading, setIsRejectLoading] = useState<boolean>(false);
  const { config } = useAppSelector(selectApp);
  const { address } = useContext(AppContext);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const multisigAddress = searchParams.get("address");
  const signer = ccc.useSigner();
  const { getToken } = useTokens();
  const [tokenInfo, setTokenInfo] = useState<
    { name: string; symbol: string; decimal: number } | undefined
  >(undefined);

  const statusTxt = useMemo(() => {
    if (!transaction) return STATUS_TEXT[TransactionStatus.WaitingSigned];
    return STATUS_TEXT[transaction.status];
  }, [transaction]);

  const isConfirmed = useMemo(() => {
    return transaction?.confirmed.some((z) => isAddressEqual(z, address));
  }, [address, transaction]);

  const isRejected = useMemo(() => {
    return transaction?.rejected.some((z) => isAddressEqual(z, address));
  }, [address, transaction]);

  const rawTx = useMemo(() => {
    return JSON.parse(transaction.payload) as cccA.JsonRpcTransaction;
  }, [transaction]);

  const getTokenInfo = async () => {
    const firstOutput = rawTx.outputs[0];
    if (!!firstOutput.type) {
      const cccScript = ccc.Script.from({
        codeHash: firstOutput.type?.code_hash,
        hashType: firstOutput.type?.hash_type,
        args: firstOutput.type?.args!,
      });
      setTokenInfo(await getToken(cccScript.hash()));
    }
  };

  useEffect(() => {
    if (rawTx && rawTx.outputs[0].type) {
      getTokenInfo();
    } else {
      setTokenInfo({ name: "CKB", symbol: "CKB", decimal: 8 });
    }
  }, [rawTx]);

  const confirm = async () => {
    setIsConfirmLoading(true);
    try {
      if (!signer) return;
      const jsonTx = JSON.parse(transaction.payload) as cccA.JsonRpcTransaction;
      const rawTx = cccA.JsonRpcTransformers.transactionTo({ ...jsonTx });
      for (let i = 0; i < rawTx.inputs.length; i++) {
        const input = rawTx.inputs[i];
        const cellInput = await signer.client.getCell({
          txHash: input.previousOutput.txHash,
          index: input.previousOutput.index,
        });

        rawTx.inputs[i].cellOutput = cellInput?.cellOutput;
      }

      const signature = await signer.signOnlyTransaction(rawTx);
      const witnesses = signature.witnesses.toString();
      const { data } = await api.post("/multi-sig/signature", {
        txid: transaction.transaction_id,
        signature: witnesses.slice(42),
      });

      if (data && !!data.transaction_id) {
        toast.success("Transaction signed successfully");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send transaction");
    } finally {
      setIsConfirmLoading(false);
    }

    await dispatch(
      loadInfo({ address: multisigAddress!, networkConfig: config })
    );
    refresh?.();
  };

  const onReject = async () => {
    setIsRejectLoading(true);
    try {
      const transactionId = transaction.transaction_id;
      const { data } = await api.put(
        `/multi-sig/transactions/${transactionId}/reject`
      );

      if (data && !!data.result) {
        toast.success("Transaction rejection successful");
      }
      refresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRejectLoading(false);
    }
  };

  const txAmount = useMemo(() => {
    try {
      if (rawTx.outputs_data[0] !== "0x") {
        const amount = ccc.numLeFromBytes(ccc.bytesFrom(rawTx.outputs_data[0]));
        return BI.from(amount)
          .div(10 ** (tokenInfo?.decimal || 8))
          .toNumber();
      }
    } catch (e: any) {}

    return new Decimal(transaction.amount).div(10 ** 8).toNumber();
  }, [rawTx, tokenInfo]);

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
        <div className="flex gap-2 justify-between w-[45%] pr-10">
          <div className="flex gap-2 items-center">
            <IcnSend className="w-4" />
            <p className="text-[16px] leading-[20px] font-medium text-dark-100">
              Send
            </p>
          </div>

          <p className="text-[16px] leading-[20px] font-medium text-grey-400">
            -{formatNumber(txAmount, 0, 8)} {tokenInfo?.symbol}
          </p>
        </div>
        <div className="w-[15%] text-[16px] leading-[20px] font-medium text-grey-400 grid gap-4 pl-2">
          <p>
            {formatDistanceStrict(
              new Date(transaction.created_at * 1000),
              new Date()
            )}
          </p>
        </div>
        <div className="w-[40%] flex items-center gap-3 pl-4">
          <div className="flex justify-between flex-1">
            <div className="flex gap-1 items-center">
              {transaction.status === TransactionStatus.Sent ? (
                <div className="w-6 aspect-square p-[2px]">
                  <IcnChecked className="fill-success-100 w-full" />
                </div>
              ) : (
                <IcnUserGroup
                  className={cn("w-6", {
                    "stroke-error-100":
                      transaction.status === TransactionStatus.Failed ||
                      transaction.status === TransactionStatus.Rejected,
                  })}
                />
              )}

              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100`,
                  {
                    "text-success-200":
                      transaction.status === TransactionStatus.Sent,
                    "text-error-100":
                      transaction.status === TransactionStatus.Failed ||
                      transaction.status === TransactionStatus.Rejected,
                  }
                )}
              >
                {`${transaction.confirmed.length} out of ${accountInfo.threshold}`}
              </p>
            </div>
            {!isConfirmed &&
            transaction.status === TransactionStatus.WaitingSigned ? (
              !isRejected ? (
                <Button
                  size="small"
                  kind="secondary"
                  className="!py-[5px]"
                  disabled={isConfirmLoading}
                  loading={isConfirmLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirm();
                  }}
                >
                  Confirm
                </Button>
              ) : (
                <p
                  className={`text-[16px] leading-[20px] font-medium text-error-100 capitalize`}
                >
                  Rejected
                </p>
              )
            ) : (
              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100 capitalize`,
                  {
                    "text-success-200":
                      transaction.status === TransactionStatus.Sent,
                    "text-error-100":
                      transaction.status === TransactionStatus.Failed ||
                      transaction.status === TransactionStatus.Rejected,
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
        <div className="w-[60%] px-4 py-6 grid gap-3 border-r border-grey-300 content-start sticky top-0">
          <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
            <p className="w-[90px] font-medium">To Address:</p>
            <p>{shortAddress(transaction.to_address, 14)}</p>
          </div>
          <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
            <p className="w-[90px] font-medium">Created:</p>
            <p>
              {format(
                new Date(transaction.created_at * 1000),
                "MMM d, yyyy hh:mm:ss a"
              )}
            </p>
          </div>
          {transaction.status === TransactionStatus.WaitingSigned ? (
            <p className="text-[16px] leading-[20px] font-medium text-orange-100">
              Number of confirmations required: {accountInfo.threshold}
            </p>
          ) : null}
          {transaction.status === TransactionStatus.Sent ? (
            <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
              <p className="w-[90px] font-medium">Explorer:</p>
              <Link
                href={`${config.explorer}/transaction/0x${transaction.transaction_id}`}
                target="_blank"
              >
                <IcnExternalLink className="w-[16px] stroke-grey-400 transition-colors hover:stroke-dark-100" />
              </Link>
            </div>
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
                ) : transaction.rejected.length > 0 ? (
                  <svg
                    width="15"
                    height="14"
                    viewBox="0 0 15 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      opacity="0.3"
                      d="M8 14C11.866 14 15 10.866 15 7C15 3.13401 11.866 0 8 0C4.13401 0 1 3.13401 1 7C1 10.866 4.13401 14 8 14Z"
                      fill="#FF3333"
                    />
                    <path
                      d="M8 12C10.7614 12 13 9.76143 13 7C13 4.23858 10.7614 2 8 2C5.23858 2 3 4.23858 3 7C3 9.76143 5.23858 12 8 12Z"
                      fill="#FF3333"
                    />
                  </svg>
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
                {transaction.rejected.map((z, i) => (
                  <div
                    key={`rejected-${i}`}
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
                      <p className="text-rejected-100 font-normal text-[14px]">
                        {shortAddress(z, 14)}
                      </p>
                      <div className="px-1 py-[2px] bg-[#FEE7E7] rounded-[4px] text-[10px] leading-[16px] text-error-100">
                        Rejected
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {transaction.status === TransactionStatus.Failed && (
              <div className="relative">
                <div className="flex gap-2 items-center bg-light-100">
                  <svg
                    width="15"
                    height="14"
                    viewBox="0 0 15 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      opacity="0.3"
                      d="M8 14C11.866 14 15 10.866 15 7C15 3.13401 11.866 0 8 0C4.13401 0 1 3.13401 1 7C1 10.866 4.13401 14 8 14Z"
                      fill="#FF3333"
                    />
                    <path
                      d="M8 12C10.7614 12 13 9.76143 13 7C13 4.23858 10.7614 2 8 2C5.23858 2 3 4.23858 3 7C3 9.76143 5.23858 12 8 12Z"
                      fill="#FF3333"
                    />
                  </svg>

                  <p className="font-medium text-error-100">Errors </p>
                </div>
                <div className="grid gap-4 mt-5">
                  {transaction.errors?.map((z, i) => (
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
                        <p className="text-error-100 font-normal text-[14px]">
                          {z.signer_address.length > 20
                            ? shortAddress(z.signer_address, 5)
                            : z.signer_address}
                          : {z.error_msg}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {transaction.status === TransactionStatus.Sent && (
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
            )}
            {transaction.status === TransactionStatus.WaitingSigned && (
              <div className="flex gap-2 items-center bg-light-100 relative">
                <div className="border border-grey-500 rounded-full w-4 aspect-square"></div>
                <p className="font-medium text-grey-400">Completed</p>
              </div>
            )}

            {(transaction.status === TransactionStatus.Rejected ||
              transaction.status === TransactionStatus.Failed) && (
              <div className="flex gap-2 items-center bg-light-100 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#ff3333"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                    clipRule="evenodd"
                  />
                </svg>

                <p className="font-medium text-error-100">Not completed</p>
              </div>
            )}
          </div>
          {transaction.status === TransactionStatus.WaitingSigned ? (
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button
                fullWidth
                size="small"
                disabled={isConfirmed || isConfirmLoading || isRejected}
                loading={isConfirmLoading}
                onClick={confirm}
              >
                Confirm
              </Button>
              {/* {!isConfirmed && (
                <Button
                  fullWidth
                  size="small"
                  kind="danger-outline"
                  disabled={isRejectLoading || isRejected}
                  onClick={onReject}
                >
                  Reject
                </Button>
              )} */}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
