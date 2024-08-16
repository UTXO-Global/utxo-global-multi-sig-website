import cn from "@/utils/cn";

import IcnChecked from "@/public/icons/icn-checked.svg";
import { useMemo } from "react";

const STEPS = [1, 2, 3];

const LineStep = ({ step }: { step: number }) => {
  const lineWidth = useMemo(() => {
    if (step === 1) return 0;
    if (step === 2) return 50;
    return 100;
  }, [step]);
  return (
    <div className="w-[290px] h-1 bg-grey-300 mx-auto relative my-2">
      <div
        className={cn(`h-1 absolute left-0 top-0 bg-orange-100 transition-all`)}
        style={{
          width: `${lineWidth}%`,
        }}
      ></div>
      {STEPS.map((z, i) => (
        <div
          key={i}
          className={cn(
            `w-5 h-5 bg-grey-200 flex justify-center items-center text-[12px] text-light-100 font-medium rounded-full absolute top-1/2 -translate-y-1/2`,
            {
              "bg-orange-100": step >= z,
              "left-0": z === 1,
              "right-0": z === 3,
              "left-1/2 -translate-x-1/2": z === 2,
            }
          )}
        >
          {z < step ? <IcnChecked className="fill-light-100 w-[12px]" /> : z}
        </div>
      ))}
    </div>
  );
};

export default LineStep;
