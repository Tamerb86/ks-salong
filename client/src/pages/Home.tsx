import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
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
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const { data: stats } = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-amber-600">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-white font-semibold text-lg">Loading K.S Salong...</p>
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
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                K.S Salong
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Professional Salon Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">Appointments</p>
                <p className="text-sm text-purple-600">Smart Booking</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-amber-900">Queue</p>
                <p className="text-sm text-amber-600">Walk-in Management</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-purple-900">POS</p>
                <p className="text-sm text-purple-600">Point of Sale</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <BarChart3 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-amber-900">Analytics</p>
                <p className="text-sm text-amber-600">Business Insights</p>
              </div>
            </div>

            <a href={getLoginUrl()}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Sign In to Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>

            <p className="text-center text-sm text-gray-500">
              Secure authentication powered by Manus
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-600">Here's what's happening at K.S Salong today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100">Today's Appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{stats?.todayAppointments || 0}</div>
                  <p className="text-sm text-purple-100 mt-1">
                    {stats?.todayAppointments && stats.todayAppointments > 0
                      ? `+${stats.todayAppointments} from yesterday`
                      : "No change"}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-100">Revenue Today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{stats?.todayRevenue || 0} kr</div>
                  <p className="text-sm text-amber-100 mt-1">
                    {stats?.revenueChange ? `+${stats.revenueChange}% from yesterday` : "No change"}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-100">Queue Length</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{stats?.queueLength || 0}</div>
                  <p className="text-sm text-blue-100 mt-1">Walk-in customers</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-100">Staff On Duty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{stats?.staffOnDuty || 0}</div>
                  <p className="text-sm text-green-100 mt-1">All stations active</p>
                </div>
                <UserCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/appointments">
              <Card className="border-2 border-transparent hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer group bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-colors shadow-md">
                      <Calendar className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Appointments</CardTitle>
                      <CardDescription>View and manage bookings</CardDescription>
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
                      <CardTitle className="text-lg">Queue</CardTitle>
                      <CardDescription>Manage walk-in customers</CardDescription>
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
                      <CardDescription>Process sales and payments</CardDescription>
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
                    <CardTitle className="text-lg">Customers</CardTitle>
                    <CardDescription>Customer database and CRM</CardDescription>
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
                    <CardTitle className="text-lg">Reports</CardTitle>
                    <CardDescription>Sales and analytics</CardDescription>
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
                      <CardTitle className="text-lg">Time Clock</CardTitle>
                      <CardDescription>Staff time tracking</CardDescription>
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
