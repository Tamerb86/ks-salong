import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  className?: string;
  text?: string;
}

export function LiveBadge({ className, text = "Live" }: LiveBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      {text}
    </div>
  );
}
