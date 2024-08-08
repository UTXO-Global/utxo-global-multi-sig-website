"use client";

import { useState } from "react";

import Button from "../Common/Button";
import IcnSend from "@/public/icons/icn-send.svg";
import IcnChevron from "@/public/icons/icn-chevron.svg";
import IcnChecked from "@/public/icons/icn-checked.svg";
import IcnUserGroup from "@/public/icons/icn-user-group.svg";

import cn from "@/utils/cn";

const Transaction = ({
  status = "pending",
  isConfirm,
}: {
  status?: string;
  isConfirm?: boolean;
}) => {
  const [isShow, setIsShow] = useState<boolean>(false);

  return (
    <div className="rounded-lg bg-light-100 overflow-hidden">
      <div
        className={cn(
          `px-4 py-[18px] flex items-center cursor-pointer hover:bg-grey-200 transition-colors`,
          {
            "py-[14px]": isConfirm,
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
          <p>-100 CKB</p>
          <p>1 minute ago</p>
        </div>
        <div className="w-[40%] flex items-center gap-3 pl-4">
          <div className="flex justify-between flex-1">
            <div className="flex gap-1 items-center">
              {status === "success" ? (
                <div className="w-6 aspect-square p-[2px]">
                  <IcnChecked className="fill-success-100 w-full" />
                </div>
              ) : status === "pending" ? (
                <IcnUserGroup className="w-6" />
              ) : (
                <IcnUserGroup className="w-6 stroke-error-100" />
              )}

              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100`,
                  {
                    "text-success-200": status === "success",
                    "text-error-100": status === "unsuccess",
                  }
                )}
              >
                {status === "success" ? `2 out of 2` : `1 out of 2`}
              </p>
            </div>
            {isConfirm ? (
              <Button size="small" kind="secondary" className="!py-[5px]">
                Confirm
              </Button>
            ) : (
              <p
                className={cn(
                  `text-[16px] leading-[20px] font-medium text-orange-100 capitalize`,
                  {
                    "text-success-200": status === "success",
                    "text-error-100": status === "unsuccess",
                    "mr-[10px]": status === "pending",
                  }
                )}
              >
                {status}
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
            <p>ckt1qzda0cr08m85...7tfcu</p>
          </div>
          <div className="flex gap-8 text-[16px] leading-[20px] text-grey-400">
            <p className="w-[90px] font-medium">Created:</p>
            <p>Jul 19, 2024, 11:01:11 AM</p>
          </div>
          <p className="text-[16px] leading-[20px] font-medium text-orange-100">
            Number of confirmations required: 2
          </p>
        </div>
        <div className="w-[40%] p-4">
          <div
            className={cn(
              `text-[16px] leading-[20px] grid gap-6 relative transition-all max-h-[calc(100%-64px)] overflow-auto`,
              {
                "max-h-full": status !== "pending",
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
                {status === "success" ? (
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
                ) : status === "pending" ? (
                  <div className="border border-grey-500 rounded-full w-4 aspect-square"></div>
                ) : (
                  <div className="w-4 aspect-square bg-error-100/30 rounded-full flex justify-center items-center">
                    <div className="w-[10px] aspect-square rounded-full bg-error-100"></div>
                  </div>
                )}

                <p className="font-medium text-dark-100">
                  Confirmed{" "}
                  <span className="text-grey-400">
                    {status === "success" ? `(2 of 2)` : `(1 of 2)`}
                  </span>
                </p>
              </div>
              <div className="grid gap-4 mt-5">
                <div className="flex gap-2 items-center">
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
                      ckt1qzda...abc4sr05
                    </p>
                    <div className="px-1 py-[2px] bg-[#E0FBF2] rounded-[4px] text-[10px] leading-[16px] text-success-200">
                      Confirmed
                    </div>
                  </div>
                </div>
                {status === "success" ? (
                  <div className="flex gap-2 items-center">
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
                        ckt1qzda...abc4sr05
                      </p>
                      <div className="px-1 py-[2px] bg-[#E0FBF2] rounded-[4px] text-[10px] leading-[16px] text-success-200">
                        Confirmed
                      </div>
                    </div>
                  </div>
                ) : status === "unsuccess" ? (
                  <div className="flex gap-2 items-center">
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
                        ckt1qzda...abc4sr05
                      </p>
                      <div className="px-1 py-[2px] bg-[#FEE7E7] rounded-[4px] text-[10px] leading-[16px] text-error-100">
                        Rejected
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            {status === "success" ? (
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
            ) : status === "pending" ? (
              <div className="flex gap-2 items-center bg-light-100 relative">
                <div className="border border-grey-500 rounded-full w-4 aspect-square"></div>
                <p className="font-medium text-grey-400">Completed</p>
              </div>
            ) : null}
          </div>
          {status === "pending" ? (
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button fullWidth size="small" disabled={!isConfirm}>
                Confirm
              </Button>
              <Button fullWidth size="small" kind="danger-outline">
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
