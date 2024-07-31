/* eslint-disable @next/next/no-img-element */
import IcnExternalLink from "@/public/icons/icn-external-link.svg";

const Assets = () => {
  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 pt-4 bg-light-100 flex justify-start">
        <div className="px-6 pt-3 pb-4 border-b-2 border-dark-100 text-[16px] leading-[20px] font-bold text-dark-100">
          Tokens
        </div>
      </div>
      <div className="py-4 px-6">
        <div className="rounded-lg bg-light-100 overflow-hidden">
          <div className="text-[16px] leading-[40px] text-grey-400 font-medium px-6 py-2 border-b border-grey-300 flex">
            <div className="w-[60%]">Asset</div>
            <div className="w-[20%]">Balance</div>
            <div className="w-[20%] text-right">Value</div>
          </div>
          <div className="px-6 py-3">
            <div className="flex items-center">
              <div className="flex items-center w-[60%] justify-start">
                <img src="/images/nervos.png" alt="ckb" className="w-8" />
                <p className="text-[14px] leading-[24px] text-dark-100 font-medium ml-2">
                  CKB
                </p>
                <IcnExternalLink className="w-4 ml-4 cursor-pointer" />
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%]">
                200
              </div>
              <div className="text-base font-medium text-dark-100 w-[20%] text-right">
                $2.4
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Assets;
