export const SITE_TITLE = "UTXO Global Multi-Sig";
export const SITE_DESCRIPTION =
  "Safeguard your UTXO assets with many private keys adding an extra layer of security.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";
export const SITE_IMAGE_URL =
  "https://config.utxo.global/images/preview-site.png";
export const CONTACT_MAIL = "contact@utxo.global";
export const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/utxo-global-wallet/lnamkkidoonpeknminiadpgjiofpdmle";
export const EXTENTSION_GITHUB =
  "https://github.com/UTXO-Global/utxo-wallet-extension";
export const SUBSTACK_LINK = "https://utxoglobal.substack.com/";
export const DOC_LINK = "https://utxo-global.gitbook.io/utxo-global";
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACIKING_ID;
export const DEFAULT_NETWORK =
  process.env.NEXT_PUBLIC_NETWORK_DEFAULT || "nervos";
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
    href: "https://github.com/UTXO-Global/utxo-wallet-extension",
    isExternal: true,
  },
];
export const FEATURE_REQUEST_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSeUC9e8ka0iSAFXR1gPjepQEcygdLgwKbtnAWfc_2IRqL1pqw/viewform";
export const LIMIT_PER_PAGE = 10;
