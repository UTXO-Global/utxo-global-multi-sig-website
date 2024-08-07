"use client";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotSupportedScreen from "@/components/NotSupportedScreen";

const WIDTH_SUPPORTED = 1024;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
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

  return (
    <>
      {isSupported ? (
        <>
          <Header />
          {children}
          <Footer />
        </>
      ) : (
        <NotSupportedScreen />
      )}
    </>
  );
};

export default MainLayout;
