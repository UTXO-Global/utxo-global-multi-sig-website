/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Popover } from "antd";

import IcnThreeDots from "@/public/icons/icn-three-dots.svg";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnTrash from "@/public/icons/icn-trash.svg";

const Actions = () => {
  const [open, setOpen] = useState(false);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100">
      <div className="px-4 py-1 flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer">
        <IcnPencil className="fill-success-100 w-4" />
        <p>Rename</p>
      </div>
      <div className="px-4 py-1 flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer">
        <IcnTrash className="stroke-error-100 w-4" />
        <p>Remove</p>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <IcnThreeDots className="w-5 cursor-pointer" />
    </Popover>
  );
};

const Account = () => {
  return (
    <div className="px-4 py-3 rounded-lg border border-grey-300 hover:bg-grey-300 transition-colors flex justify-between items-center">
      <div className="flex gap-5 items-center">
        <div className="relative">
          <img
            src="/images/account.png"
            alt="account"
            className="w-[40px] rounded-full"
          />
          <div className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full text-[8px] text-light-100 font-medium flex justify-center items-center bg-orange-100">
            2/2
          </div>
        </div>

        <p className="text-base font-medium text-dark-100">CKB Account</p>
      </div>
      <div className="gap-5 flex items-center">
        <div className="flex gap-2 items-center">
          <img
            src="/images/nervos.png"
            alt="nervos"
            className="w-6 rounded-full"
          />
          <p className="text-[14px] leading-[24px] font-medium text-dark-100">
            Pudge Testnet
          </p>
        </div>
        <Actions />
      </div>
    </div>
  );
};
export default Account;
