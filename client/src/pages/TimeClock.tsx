import { useEffect } from "react";
import { useLocation } from "wouter";

export default function TimeClock() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the new Tidsstempling page
    setLocation("/tidsstempling");
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Omdirigerer til Tidsstempling...</p>
    </div>
  );
}
