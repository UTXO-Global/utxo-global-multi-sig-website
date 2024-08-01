/* eslint-disable @next/next/no-img-element */
import IcnCopy from "@/public/icons/icn-copy.svg";
import IcnExternalLink from "@/public/icons/icn-external-link.svg";
import IcnPencil from "@/public/icons/icn-pencil.svg";
import IcnTrash from "@/public/icons/icn-trash.svg";

const AccountInfo = () => {
  return (
    <main className="h-full overflow-y-auto">
      <div className="px-6 py-4">
        <div className="p-6 pb-2 rounded-lg bg-light-100">
          <h3 className="text-[18px] leading-[24px] font-medium text-dark-100">
            Manage Account Signers
          </h3>
          <div className="mt-4">
            <div className="py-4 flex justify-between items-center border-b border-grey-300">
              <div className="flex gap-4 items-center">
                <img src="/images/account.png" alt="account" className="w-10" />
                <div>
                  <p className="text-[16px] leading-[20px] font-medium">Yang</p>
                  <div className="flex items-center">
                    <p className="text-[14px] leading-[18px] text-grey-400">
                      ckt1qzda0cr08m85hc8jlnfp3zer7xulejyw...x8sr05
                    </p>
                    <div className="p-1 hover:bg-grey-300 cursor-pointer ml-2 transition-colors rounded-full">
                      <IcnCopy className="w-4" />
                    </div>
                    <div className="p-1 hover:bg-grey-300 cursor-pointer transition-colors rounded-full">
                      <IcnExternalLink className="w-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                  <IcnPencil className="w-4 fill-grey-400" />
                </div>
                <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                  <IcnTrash className="w-4 stroke-error-100" />
                </div>
              </div>
            </div>
            <div className="py-4 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <img src="/images/account.png" alt="account" className="w-10" />
                <div>
                  <p className="text-[16px] leading-[20px] font-medium">yangiv</p>
                  <div className="flex items-center">
                    <p className="text-[14px] leading-[18px] text-grey-400">
                      ckt1qzda0cr08m85hc8jlnfp3zer7xulejyw...x8sr05
                    </p>
                    <div className="p-1 hover:bg-grey-300 cursor-pointer ml-2 transition-colors rounded-full">
                      <IcnCopy className="w-4" />
                    </div>
                    <div className="p-1 hover:bg-grey-300 cursor-pointer transition-colors rounded-full">
                      <IcnExternalLink className="w-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                  <IcnPencil className="w-4 fill-grey-400" />
                </div>
                <div className="p-2 rounded-full transition-colors hover:bg-grey-300 cursor-pointer">
                  <IcnTrash className="w-4 stroke-error-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-light-100 mt-4">
          <h3 className="text-[18px] leading-[24px] font-medium text-dark-100">
            Required Confirmations
          </h3>
          <p className="text-[16px] leading-[20px] text-grey-400 mt-2">
            Any transaction requires the confirmation of:
          </p>
          <p className="mt-[18px] text-[16px] leading-[20px] font-medium">
            2 out of 2 signers
          </p>
        </div>
      </div>
    </main>
  );
};

export default AccountInfo;
