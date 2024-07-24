/* eslint-disable @next/next/no-img-element */
import { Modal } from "antd";

import IcnChecked from "@/public/icons/icn-checked.svg";
import IcnCopy from "@/public/icons/icn-copy.svg";

const Success = ({
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
        width={564}
      >
        <div className="bg-light-100 rounded-[16px] p-[60px]">
          <div className="w-[90px] h-[90px] flex justify-center items-center bg-[#EDFBEF] rounded-full mx-auto">
            <IcnChecked className="w-[50px] fill-success-100" />
          </div>
          <p className="text-[20px] leading-[28px] font-bold text-dark-100 text-center mt-8">
            Your Account Is All Set!
          </p>
          <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2">
            Start your journey to the smart account security now Use your
            address to receive funds on Nervos{" "}
          </p>
          <div className="my-8 rounded-lg bg-grey-300 px-4 py-3 flex gap-5">
            <img src="/images/account.png" alt="account" className="w-10" />
            <div>
              <p className="text-base font-medium text-dark-100">CKB Account</p>
              <div className="flex gap-4 items-center">
                <p className="text-[18px] leading-[24px] text-dark-100">
                  ckt1qzda0cr08m85u...4damf0j73qvr6t5
                </p>
                <IcnCopy className="cursor-pointer w-4" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Success;
