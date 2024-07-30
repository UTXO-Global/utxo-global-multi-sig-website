/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Popover, Modal } from "antd";

import Button from "@/components/Common/Button";
import IcnThreeDots from "@/public/icons/icn-three-dots.svg";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnTrash from "@/public/icons/icn-trash.svg";
import IcnTimesCircle from "@/public/icons/icn-times-circle.svg";

const EditName = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
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
              placeholder="CKB Partners"
            />
            <IcnTimesCircle className="w-4 cursor-pointer" />
          </div>
          <div className="p-4 rounded-lg bg-grey-300 text-[16px] leading-[20px] text-dark-100 mt-4">
            ckt1qzda0cr08m85hc8jlnfxdfrgurdas8m85hc8jlnfxdfrgurd..
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

const Actions = () => {
  const [open, setOpen] = useState(false);
  const [isShowEditName, setIsShowEditName] = useState<boolean>(false);

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const content = (
    <div className="py-1 bg-light-100 text-[14px] leading-[20px] rounded-lg overflow-hidden font-medium text-dark-100">
      <div
        className="px-4 py-1 flex gap-2 hover:bg-grey-300 transition-colors items-center cursor-pointer"
        onClick={() => {
          setIsShowEditName(true);
          hide();
        }}
      >
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
    <>
      <Popover
        content={content}
        placement="bottomLeft"
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <IcnThreeDots className="w-5 cursor-pointer" />
      </Popover>
      <EditName
        isModalOpen={isShowEditName}
        setIsModalOpen={(val) => setIsShowEditName(val)}
      />
    </>
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
        <div>
          <p className="text-base font-medium text-dark-100">CKB Account</p>
          <p className="text-[14px] leading-[24px] text-grey-400">
            <span className="text-dark-100">Pud:</span> ckt1qzda...rt7rr
          </p>
        </div>
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
