import Button from "../Common/Button";
import Account from "./Account";
import InvitationAccount from "./InvitationAccount";

const ListAccounts = ({ onCreateAccount }: { onCreateAccount: () => void }) => {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[24px] leading-[28px] font-bold text-dark-100">
          Multi Sign Accounts
        </h3>
        <Button size="small" onClick={onCreateAccount}>
          Create Account
        </Button>
      </div>
      <div className="px-6 py-5 rounded-lg bg-light-100">
        <p className="text-[20px] leading-[28px] font-medium text-dark-100">
          Accounts <span className="text-grey-400">(2)</span>
        </p>
        <div className="mt-[10px] grid gap-2">
          <Account />
          <Account />
          <Account />
          <Account />
          <Account />
        </div>
      </div>
      <div className="px-6 py-5 rounded-lg bg-light-100">
        <p className="text-[20px] leading-[28px] font-medium text-dark-100">
          Invitation List <span className="text-grey-400">(1)</span>
        </p>
        <div className="mt-[10px] grid gap-2">
          {true ? (
            <>
              <InvitationAccount />
            </>
          ) : (
            <p className="text-[16px] leading-[20px] text-grey-500 text-center mt-2 mb-6">
              Watch any Account to keep an <br /> eye on its activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAccounts;
