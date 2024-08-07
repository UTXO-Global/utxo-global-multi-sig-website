/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Modal, QRCode } from "antd";

import IcnQrBold from "@/public/icons/icn-qr-bold.svg";
import IcnCopy from "@/public/icons/icn-copy.svg";
import { MultiSigAccountType } from "@/types/account";
import { shortAddress, copy } from "@/utils/helpers";

const ReceiveTokens = ({ account }: { account: MultiSigAccountType }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      <div
        className="w-8 aspect-square rounded-[4px] bg-grey-300 flex justify-center items-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <IcnQrBold className="w-4" />
      </div>
      <Modal
        open={isModalOpen}
        centered={true}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={476}
      >
        <div className="bg-light-100 rounded-[16px] p-6">
          <h3 className="text-[24px] leading-[28px] font-medium text-dark-100">
            Receive Tokens
          </h3>
          <div className="mt-10 grid gap-4">
            <div className="flex justify-center">
              <QRCode
                value={account.multi_sig_address}
                icon="/images/nervos.png"
                
                size={200}
              />
            </div>
            <p className="text-[16px] leading-[20px] text-orange-100 text-center">
              Only send Pudget Testnet assets to this Account.
            </p>
            <div className="px-4 py-3 rounded-lg bg-grey-300 flex items-center gap-2">
              <img src="/images/account.png" alt="account" className="w-10" />
              <div className="">
                <p className="text-[16px] leading-[24px]">{account.name}</p>

                <div className="flex items-center gap-4">
                  <p className="text-[18px] leading-[24px]">
                    {shortAddress(account.multi_sig_address, 14)}
                  </p>
                  <IcnCopy
                    className="w-4 cursor-pointer"
                    onClick={() => copy(account.multi_sig_address)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReceiveTokens;
