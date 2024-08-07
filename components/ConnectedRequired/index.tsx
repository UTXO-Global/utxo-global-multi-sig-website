import { ccc } from "@ckb-ccc/connector-react";

import Button from "../Common/Button";

const ConnectedRequired = () => {
  const { open } = ccc.useCcc();

  return (
    <div className="px-6 py-4 h-[calc(100vh-69.71px-61px)] flex items-center justify-center">
      <div
        className="rounded-[4px] flex flex-col justify-center items-center w-full h-full"
        style={{
          background: `linear-gradient(181deg, rgba(255, 255, 255, 0.60)85.23%, rgba(252, 240, 230, 0.60)90.38%, rgba(255, 225, 200, 0.60)96.83%)`,
        }}
      >
        <h3 className="text-[40px] leading-[48px] font-medium text-dark-100 text-center">
          Multi-Sign Account
        </h3>
        <p className="text-[24px] leading-[30px] text-grey-400 text-center mt-6 mb-10">
          Connect your wallet to create a new Multi-Sign Account or open an
          existing one
        </p>
        <Button onClick={open}>Connect Your Wallet</Button>
      </div>
    </div>
  );
};

export default ConnectedRequired;
