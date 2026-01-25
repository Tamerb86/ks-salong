import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (authLoading) {
    return (
      <Layout>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <p>Please log in to view appointments.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Avtaler
                </h1>
                <LiveBadge text="Live" />
              </div>
              <p className="text-gray-600 mt-1">Administrer avtaler med kalender- eller listevisning</p>
            </div>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Kalendervisning
              </TabsTrigger>
              <TabsTrigger value="list">Listevisning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-6">
              <MonthlyCalendar />
            </TabsContent>
            
            <TabsContent value="list" className="mt-6">
              <div className="text-center py-12 text-gray-500">
                <p>Listevisning kommer snart...</p>
                <p className="text-sm mt-2">Bruk kalendervisning for å se og administrere avtaler</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
