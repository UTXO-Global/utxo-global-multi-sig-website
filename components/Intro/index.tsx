import U from "@/public/icons/u.svg";
import T from "@/public/icons/t.svg";
import X from "@/public/icons/x.svg";
import O from "@/public/icons/o.svg";
import Global from "@/public/icons/global.svg";

const Intro = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-light-100">
      <div className="flex items-center gap-2">
        <U className="w-[60px]" data-aos="fade-right" />
        <T className="w-[60px]" data-aos="fade-up" />
        <X className="w-[60px]" data-aos="fade-down" />
        <O className="w-[60px]" data-aos="fade-left" />
      </div>
      <div className="flex justify-center mt-2">
        <Global className="w-[110px]" data-aos="fade-zoom-in" data-aos-delay="700" />
      </div>
    </div>
  );
};

export default Intro;
