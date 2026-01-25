import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300",
        isOnline
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-red-100 text-red-700 border border-red-300"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Tilkoblet</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Frakoblet</span>
        </>
      )}
    </div>
  );
}
