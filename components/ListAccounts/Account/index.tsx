/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { Modal } from "antd";

import Button from "@/components/Common/Button";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnTimesCircle from "@/public/icons/icn-times-circle.svg";

import { shortAddress } from "@/utils/helpers";
import { MultiSigAccountType } from "@/types/account";
import { NETWORK } from "@/configs/common";
import { NETWORK_NAME } from "@/configs/network";

const EditName = ({
  isModalOpen,
  setIsModalOpen,
  account,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  account: MultiSigAccountType;
}) => {
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
          <div className="p-4 bg-grey-300 rounded-lg flex gap-4 items-center mt-8">
            <input
              type="text"
              className="border-none outline-none bg-transparent flex-1 text-base"
              placeholder={account.name}
            />
            <IcnTimesCircle className="w-4 cursor-pointer" />
          </div>
          <div className="p-4 rounded-lg bg-grey-300 text-[16px] leading-[20px] text-dark-100 mt-4">
            {shortAddress(account.multi_sig_address, 10)}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Button kind="secondary" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleCancel}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Account = ({ account }: { account: MultiSigAccountType }) => {
  const [isShowEditName, setIsShowEditName] = useState<boolean>(false);

  return (
    <div className="px-4 py-3 rounded-lg border border-grey-300 hover:bg-grey-300 transition-colors flex justify-between items-center cursor-pointer">
      <Link href="/dashboard/assets" className="flex gap-5 items-center">
        <div className="relative">
          <img
            src="/images/account.png"
            alt="account"
            className="w-[40px] rounded-full"
          />
          <div className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full text-[8px] text-light-100 font-medium flex justify-center items-center bg-orange-100">
            {account.threshold}/{account.signers}
          </div>
        </div>
        <div>
          <p className="text-base font-medium text-dark-100">{account.name}</p>
          <p className="text-[14px] leading-[24px] text-grey-400">
            <span className="text-dark-100">Pud:{" "}</span>
            {shortAddress(account.multi_sig_address, 10)}
          </p>
        </div>
      </Link>
      <div className="gap-4 flex items-center">
        <div className="flex gap-2 items-center">
          <img
            src="/images/nervos.png"
            alt="nervos"
            className="w-6 rounded-full"
          />
          <p className="text-[14px] leading-[24px] font-medium text-dark-100">
            {NETWORK_NAME[NETWORK]}
          </p>
        </div>
        {/* TODO: edit account name */}
        {/* <IcnPencil
          className="w-4 fill-grey-400 cursor-pointer"
          onClick={(e: any) => {
            setIsShowEditName(true);
            e.stopPropagation();
          }}
        /> */}
        <EditName
          account={account}
          isModalOpen={isShowEditName}
          setIsModalOpen={(val) => setIsShowEditName(val)}
        />
      </div>
    </div>
  );
};
export default Account;
