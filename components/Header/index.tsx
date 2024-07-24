/* eslint-disable @next/next/no-img-element */
import SwitchNetwork from "../SwitchNetwork";
const Header = () => {
  return (
    <header className="bg-light-100 border-b border-grey-200">
      <div className="container py-4 flex justify-between">
        <img src="/logo.png" alt="utxo global" className="w-[80px]" />
        <SwitchNetwork />
      </div>
    </header>
  );
};

export default Header;
