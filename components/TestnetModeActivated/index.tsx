"use client";

import { useState } from "react";
import { Modal, Checkbox } from "antd";
import type { CheckboxProps } from "antd";

import Button from "../Common/Button";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setIsDontShowAgainTestnetPopup } from "@/redux/features/storage/action";
import { selectStorage } from "@/redux/features/storage/reducer";

const TestnetModeActivated = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [isDontShowAgain, setIsDontShowAgain] = useState<boolean>(false);

  const { isDontShowAgainTestnetPopup } = useAppSelector(selectStorage);
  const dispatch = useAppDispatch();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    dispatch(setIsDontShowAgainTestnetPopup(isDontShowAgain));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    dispatch(setIsDontShowAgainTestnetPopup(isDontShowAgain));
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    setIsDontShowAgain(e.target.checked);
  };

  if (isDontShowAgainTestnetPopup) return null;

  return (
    <>
      <Modal
        open={isModalOpen}
        centered={true}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={500}
        closeIcon={false}
      >
        <div className="bg-light-100 rounded-[16px] p-6">
          <h3 className="text-[20px] leading-[28px] text-center font-medium text-dark-100 mt-4">
            Testnet Mode Activated
          </h3>
          <p className="text-[16px] leading-[20px] text-grey-400 text-center mt-2 max-w-[400px] mx-auto">
            Please note that the Testnet environment is for testing purposes
            only. Data and transactions here may be cleared periodically.
          </p>
          <div className="mt-8 flex justify-center items-center gap-2">
            <Checkbox onChange={onChange} />
            <span className="text-[16px] leading-[20px] font-medium text-grey-400">
              Do not show this again
            </span>
          </div>
          <Button className="mt-4" fullWidth onClick={handleOk}>
            I Understand
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default TestnetModeActivated;
