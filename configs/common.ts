export const SITE_TITLE = "UTXO Global Multi-Sig";
export const SITE_DESCRIPTION =
  "Safeguard your UTXO assets with many private keys adding an extra layer of security.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";
export const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "";
export const SITE_IMAGE_URL =
  "https://config.utxo.global/images/preview-site.png";
export const CONTACT_MAIL = "contact@utxo.global";
export const EXTENTSION_GITHUB =
  "https://github.com/UTXO-Global/utxo-wallet-extension";
export const SUBSTACK_LINK = "https://utxoglobal.substack.com/";
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACIKING_ID;
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "nervos_testnet";
export const EXPLORER =
  NETWORK === "nervos_testnet"
    ? "https://pudge.explorer.nervos.org/en"
    : "https://explorer.nervos.org/en";

export const NAVIGATIONS = [
  {
    id: "about-us",
    label: "About Us",
    href: "/#about-us",
    isExternal: false,
  },
  {
    id: "features",
    label: "Features",
    href: "/#features",
    isExternal: false,
  },
  {
    id: "contact",
    label: "Contact",
    href: "/#contact",
    isExternal: false,
  },
  {
    id: "github",
    label: "GitHub",
    href: EXTENTSION_GITHUB,
    isExternal: true,
  },
];
