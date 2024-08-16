import { useState, useEffect } from "react";

const WIDTH_SUPPORTED = 1024;

const useSupportedScreen = () => {
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsSupported(window.innerWidth >= WIDTH_SUPPORTED);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isSupported,
  };
};

export default useSupportedScreen;
