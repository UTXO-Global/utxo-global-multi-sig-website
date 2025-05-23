import Button from "@/components/Common/Button";
import cn from "@/utils/cn";
import { useEffect } from "react";

const exampleSamePrice = "Example\nckb1q...rdsr9lalq\nckb1q...jq2rdms8";
const exampleCustomPrice =
  "Example\nckb1q...rdsr9lalq,100\nckb1q...jq2rdms8,200";

const AmountType = ({
  isCustom,
  setIsCustom,
  setPlaceholder,
}: {
  isCustom: boolean;
  setIsCustom: (v: boolean) => void;
  setPlaceholder: (s: string) => void;
}) => {
  useEffect(() => {
    setPlaceholder(isCustom ? exampleCustomPrice : exampleSamePrice);
  }, [isCustom]);
  return (
    <div className="bg-grey-300 p-2 flex gap-2 max-w-max rounded-lg">
      <Button
        className={cn({
          "!bg-grey-300 !border-none !text-dark-300": isCustom,
        })}
        onClick={() => {
          setIsCustom(false);
        }}
      >
        Transfer Same Amount
      </Button>
      <Button
        className={cn({
          "!bg-grey-300 !border-none !text-dark-300": !isCustom,
        })}
        onClick={() => {
          setIsCustom(true);
        }}
      >
        Transfer Custom Amount
      </Button>
    </div>
  );
};

export default AmountType;
