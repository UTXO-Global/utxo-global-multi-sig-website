/* eslint-disable @next/next/no-img-element */
import Button from "@/components/Common/Button";

const NewTransaction = () => {
  return (
    <main className="min-h-screen">
      <div className="pt-[28px] pb-[62px] flex flex-col items-center max-w-[700px] mx-auto bg-light-100 mt-[76px] rounded-lg overflow-hidden relative">
      <div className="w-full h-1 bg-[#D9D9D9] absolute top-0 left-0"></div>
        <div className="w-1/3 h-1 bg-orange-100 absolute top-0 left-0"></div>
        <img
          src="/images/new-transaction.png"
          alt="new transaction"
          className="w-20"
        />
        <p className="text-[20px] leading-[28px] font-medium text-dark-100 mt-4 mb-6">
          New Transaction
        </p>
        <Button>Send Tokens</Button>
      </div>
    </main>
  );
};

export default NewTransaction;
