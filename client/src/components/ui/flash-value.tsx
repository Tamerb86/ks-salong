import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlashValueProps {
  value: string | number;
  className?: string;
  flashDuration?: number;
}

export function FlashValue({ value, className, flashDuration = 1000 }: FlashValueProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevValue !== value) {
      const numPrev = typeof prevValue === "string" ? parseFloat(prevValue) : prevValue;
      const numCurrent = typeof value === "string" ? parseFloat(value) : value;
      
      if (!isNaN(numPrev) && !isNaN(numCurrent)) {
        setFlash(numCurrent > numPrev ? "up" : "down");
        setTimeout(() => setFlash(null), flashDuration);
      }
      
      setPrevValue(value);
    }
  }, [value, prevValue, flashDuration]);

  return (
    <span
      className={cn(
        "transition-all duration-300",
        flash === "up" && "text-green-600 scale-110",
        flash === "down" && "text-red-600 scale-110",
        className
      )}
    >
      {value}
    </span>
  );
}
