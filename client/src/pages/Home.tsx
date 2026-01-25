import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { LiveBadge } from "@/components/ui/live-badge";
import { FlashValue } from "@/components/ui/flash-value";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Scissors,
  ArrowRight,
} from "lucide-react";
import { FikenSyncStatusCard } from "@/components/FikenSyncStatusCard";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-amber-600">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mx-auto"></div>
            <Scissors className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-white font-semibold text-lg">Laster K.S Salong...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-amber-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Scissors className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                K.S Salong
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Profesjonelt Salong Administrasjonssystem
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">Avtaler</p>
                <p className="text-sm text-purple-600">Smart Booking</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-amber-900">Kø</p>
                <p className="text-sm text-amber-600">Walk-in Håndtering</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">POS</p>
                <p className="text-sm text-purple-600">Salgssted</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <BarChart3 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-amber-900">Analyse</p>
                <p className="text-sm text-amber-600">Forretningsinnsikt</p>
              </div>
            </div>

            <a href={getLoginUrl()}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Logg inn for å fortsette
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>

            <p className="text-center text-sm text-gray-500">
              Sikker autentisering drevet av Manus
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <ConnectionStatus />
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Velkommen tilbake, {user.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-600">Her er hva som skjer på K.S Salong i dag</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-purple-100">Dagens avtaler</CardDescription>
                <LiveBadge className="bg-purple-400/30 text-purple-50" text="Live" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-20 bg-purple-400/30" />
                  <Skeleton className="h-4 w-32 bg-purple-400/30" />
                </div>
              ) : (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold"><FlashValue value={stats?.todayAppointments || 0} /></div>
                  <p className="text-sm text-purple-100 mt-1">
                    {stats?.todayAppointments && stats.todayAppointments > 0
                      ? `+${stats.todayAppointments} fra i går`
                      : "Ingen endring"}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-purple-200" />
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-amber-100">Inntekt i dag</CardDescription>
                <LiveBadge className="bg-amber-400/30 text-amber-50" text="Live" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-32 bg-amber-400/30" />
                  <Skeleton className="h-4 w-28 bg-amber-400/30" />
                </div>
              ) : (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold"><FlashValue value={`${stats?.todayRevenue || 0} kr`} /></div>
                  <p className="text-sm text-amber-100 mt-1">
                    {stats?.revenueChange ? `+${stats.revenueChange}% fra i går` : "Ingen endring"}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-amber-200" />
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-blue-100">Kølengde</CardDescription>
                <LiveBadge className="bg-blue-400/30 text-blue-50" text="Live" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-16 bg-blue-400/30" />
                  <Skeleton className="h-4 w-24 bg-blue-400/30" />
                </div>
              ) : (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold"><FlashValue value={stats?.queueLength || 0} /></div>
                  <p className="text-sm text-blue-100 mt-1">Walk-in kunder</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-green-100">Personale på vakt</CardDescription>
                <LiveBadge className="bg-green-400/30 text-green-50" text="Live" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-16 bg-green-400/30" />
                  <Skeleton className="h-4 w-32 bg-green-400/30" />
                </div>
              ) : (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold"><FlashValue value={stats?.staffOnDuty || 0} /></div>
                  <p className="text-sm text-green-100 mt-1">Alle stasjoner aktive</p>
                </div>
                <UserCircle className="h-12 w-12 text-green-200" />
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fiken Sync Status */}
        <FikenSyncStatusCard />

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Hurtighandlinger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/book">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Book Online</h3>
                          <p className="text-sm text-gray-600">Bestill time nå</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/appointments">
              <Card className="border-2 border-transparent hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-colors shadow-md">
                      <Calendar className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Avtaler</CardTitle>
                      <CardDescription>Se og administrer bookinger</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/queue">
              <Card className="border-2 border-transparent hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors shadow-md">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Kø</CardTitle>
                      <CardDescription>Administrer walk-in kunder</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/pos">
              <Card className="border-2 border-transparent hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-colors shadow-md">
                      <DollarSign className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">POS</CardTitle>
                      <CardDescription>Behandle salg og betalinger</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Card className="border-2 border-transparent hover:border-green-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-colors shadow-md">
                    <UserCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Kunder</CardTitle>
                    <CardDescription>Kundedatabase og CRM</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors shadow-md">
                    <BarChart3 className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Rapporter</CardTitle>
                    <CardDescription>Salg og analyse</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Link href="/time-clock">
              <Card className="border-2 border-transparent hover:border-pink-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center group-hover:from-pink-200 group-hover:to-pink-300 transition-colors shadow-md">
                      <Clock className="w-7 h-7 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Tidsstempling</CardTitle>
                      <CardDescription>Personale tidssporing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
