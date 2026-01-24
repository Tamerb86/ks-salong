import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Clock, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function QueueTV() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Auto-refresh every 10 seconds
  const { data: queue, refetch } = trpc.queue.list.useQuery(undefined, {
    refetchInterval: 10000, // 10 seconds
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manual refetch every 10 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const activeQueue = queue?.filter((item: any) => item.status === "waiting") || [];
  const nowServing = queue?.find((item: any) => item.status === "in_service");
  const nextInLine = activeQueue[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-amber-600 text-white p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <Sparkles className="h-14 w-14 text-purple-600" />
            </div>
            <div>
              <h1 className="text-7xl font-bold mb-2">K.S Salong</h1>
              <p className="text-3xl text-purple-100">Luksus OG Rimelige PRISER!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-2">
              <Clock className="h-10 w-10" />
              <p className="text-6xl font-bold">
                {format(currentTime, "HH:mm")}
              </p>
            </div>
            <p className="text-2xl text-purple-100">
              {format(currentTime, "EEEE, d. MMMM yyyy", { locale: nb })}
            </p>
          </div>
        </div>

        {/* Now Serving */}
        {nowServing ? (
          <div className="mb-16 bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-4 border-white/30 shadow-2xl animate-pulse">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-5xl font-bold">Nå betjener vi:</h2>
            </div>
            <div className="text-center py-8">
              <p className="text-9xl font-black tracking-wider">
                {nowServing.customerName}
              </p>
              {nowServing.serviceName && nowServing.serviceName !== null && (
                <p className="text-4xl text-purple-100 mt-6">
                  {nowServing.serviceName}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-16 bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-4 border-white/30 shadow-2xl">
            <div className="text-center py-12">
              <Users className="h-24 w-24 mx-auto mb-6 text-purple-200" />
              <p className="text-5xl font-bold text-purple-100">
                Ingen kunder blir betjent akkurat nå
              </p>
            </div>
          </div>
        )}

        {/* Next in Line */}
        {nextInLine && (
          <div className="mb-16 bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-4 border-amber-400/50 shadow-2xl">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold">Neste i køen:</h2>
            </div>
            <div className="text-center py-6">
              <p className="text-7xl font-black tracking-wider">
                {nextInLine.customerName}
              </p>
              {nextInLine.serviceName && nextInLine.serviceName !== null && (
                <p className="text-3xl text-purple-100 mt-4">
                  {nextInLine.serviceName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-4 border-white/30 shadow-2xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold">
              I køen ({activeQueue.length})
            </h2>
          </div>

          {activeQueue.length > 0 ? (
            <div className="space-y-4">
              {activeQueue.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/10 rounded-2xl p-8 border-2 border-white/20"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-black text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-5xl font-bold mb-2">
                        {item.customerName}
                      </p>
                      {item.serviceName && item.serviceName !== null && (
                        <p className="text-2xl text-purple-100">
                          {item.serviceName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-purple-100">
                      Estimert ventetid
                    </p>
                    <p className="text-4xl font-bold">
                      {item.estimatedWaitTime || "15"} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-20 w-20 mx-auto mb-6 text-purple-200" />
              <p className="text-4xl font-bold text-purple-100">
                Ingen kunder i køen
              </p>
              <p className="text-2xl text-purple-200 mt-4">
                Velkommen inn!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-3xl text-purple-100 mb-2">
            📍 Storgata 122C, 3915 Porsgrunn
          </p>
          <p className="text-3xl text-purple-100">
            📞 +47 929 81 628
          </p>
          <p className="text-2xl text-purple-200 mt-6">
            🏆 Norgesmester 2022
          </p>
        </div>
      </div>
    </div>
  );
}
