import Link from "next/link";

import {
  CONTACT_MAIL,
  SUBSTACK_LINK,
  MAIN_SITE_URL,
  FEATURE_REQUEST_LINK,
} from "@/configs/common";
import { TELEGRAM_LINK, TWITTER_LINK } from "@/configs/social";

import IcnTwitter from "@/public/icons/icn-twitter.svg";
import IcnTelegram from "@/public/icons/icn-telegram.svg";
import IcnDocs from "@/public/icons/icn-docs.svg";

const Footer = () => {
  return (
    <footer className="py-2 px-6 border-t border-grey-200 fixed bottom-0 left-0 z-[2] w-full bg-light-100">
      <div className="flex justify-between relative">
        <div className="py-3 flex gap-6">
          <Link
            href={FEATURE_REQUEST_LINK}
            target="_blank"
            className="text-[14px] leading-[140%] text-grey-400"
          >
            Feature Request
          </Link>
          <Link
            href={`mailto:${CONTACT_MAIL}`}
            className="text-[14px] leading-[140%] text-grey-400"
          >
            Contact Us
          </Link>
        </div>
        <p className="text-[14px] leading-[140%] text-grey-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Powered By{" "}
          <Link
            href={MAIN_SITE_URL}
            target="_blank"
            className="hover:text-orange-100 transition-colors"
          >
            UTXO GLOBAL
          </Link>{" "}
          Team
        </p>
        <div className="flex items-center gap-[6px]">
          <p className="text-xs text-grey-400 pr-4 border-r border-grey-400">{`Version: ${process.env.version}`}</p>
          <div className="flex gap-4">
            <Link
              href={TWITTER_LINK}
              target="_blank"
              className="p-[10px] rounded-lg hover:bg-grey-200 transition-colors"
            >
              <IcnTwitter className="w-6" />
            </Link>
            <Link
              href={TELEGRAM_LINK}
              target="_blank"
              className="p-[10px] rounded-lg hover:bg-grey-200 transition-colors"
            >
              <IcnTelegram className="w-6" />
            </Link>

            <Link
              href={SUBSTACK_LINK}
              target="_blank"
              className="p-[10px] rounded-lg hover:bg-grey-200 transition-colors"
            >
              <IcnDocs className="w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
