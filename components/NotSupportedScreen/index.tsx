/* eslint-disable @next/next/no-img-element */
import { CONTACT_MAIL, FEATURE_REQUEST_LINK, SITE_URL } from "@/configs/common";
import Link from "next/link";

const NotSupportedScreen = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="rounded-lg bg-light-100 px-[64px] py-6"
        style={{
          boxShadow: `0px 4px 40px 0px rgba(255, 114, 1, 0.05)`,
        }}
      >
        <img
          src="/logo.png"
          alt="utxo global"
          className="w-[100px] my-5 mx-auto"
        />
        <img
          src="/images/not-supported-screen.png"
          alt="not supported screen"
          className="w-[78px] my-10 mx-auto"
        />
        <h6 className="text-[20px] leading-[28px] font-medium text-center text-dark-100">
          Your screen size is currently unsupported.
        </h6>
        <p className="text-[16px] leading-[20px] text-grey-400 text-center max-w-[329px] mx-auto mt-4">
          We apologize for the inconvenience. For optimal viewing, please use a
          screen with a resolution of 640px or wider.
        </p>
        <div className="text-[16px] leading-[20px] text-grey-400 flex justify-center gap-2 items-center mt-10">
          <Link
            href={SITE_URL}
            target="_blank"
            className="hover:text-orange-100 transition-colors"
          >
            Home
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="4"
            viewBox="0 0 5 4"
            fill="none"
          >
            <circle cx="2.5" cy="2" r="2" fill="#787575" />
          </svg>
          <Link
            href={FEATURE_REQUEST_LINK}
            target="_blank"
            className="hover:text-orange-100 transition-colors"
          >
            Support
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="4"
            viewBox="0 0 5 4"
            fill="none"
          >
            <circle cx="2.5" cy="2" r="2" fill="#787575" />
          </svg>
          <Link
            href={`mailto:${CONTACT_MAIL}`}
            className="hover:text-orange-100 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotSupportedScreen;
