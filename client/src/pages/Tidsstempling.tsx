import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Clock, LogIn, LogOut, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

export default function Tidsstempling() {
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"clockIn" | "clockOut">("clockIn");

  
  const { data: clockedIn, refetch } = trpc.timeTracking.getClockedIn.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  const { data: activeEmployees } = trpc.staff.listActive.useQuery();
  
  const clockInMutation = trpc.timeTracking.clockIn.useMutation({
    onSuccess: (data) => {
      toast.success(`Velkommen ${data.employee.name}! Du er nå stemplet inn.`);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setPin("");
    },
  });
  
  const clockOutMutation = trpc.timeTracking.clockOut.useMutation({
    onSuccess: (data) => {
      const totalMinutes = ('totalMinutes' in data && data.totalMinutes) ? data.totalMinutes : 0;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      toast.success(`Du er nå stemplet ut. Arbeidstid: ${hours}t ${minutes}m`);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      resetForm();
    },
  });
  
  const resetForm = () => {
    setPin("");
  };
  
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      toast.error("PIN må være minst 4 siffer");
      return;
    }
    
    // Auto-login with PIN (backend will verify PIN and find employee)
    if (mode === "clockIn") {
      clockInMutation.mutate({ pin });
    } else {
      clockOutMutation.mutate({ pin });
    }
  };
  

  
  const handlePinPad = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };
  
  const handleClear = () => {
    setPin("");
  };
  

  
  const calculateDuration = (clockIn: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(clockIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}t ${minutes}m`;
  };
  
  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tidsstempling</h1>
          <p className="text-gray-600">Stemple inn og ut med PIN-kode</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clock In/Out Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                {mode === "clockIn" ? "Stemple Inn" : "Stemple Ut"}
              </CardTitle>
              <CardDescription>
                Skriv inn PIN-kode for å {mode === "clockIn" ? "starte" : "avslutte"} arbeidsdagen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mode Toggle */}
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={mode === "clockIn" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setMode("clockIn")}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Stemple Inn
                    </Button>
                    <Button
                      variant={mode === "clockOut" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setMode("clockOut")}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Stemple Ut
                    </Button>
                  </div>
                  
                  {/* PIN Input */}
                  <form onSubmit={handlePinSubmit} className="space-y-6">
                    <div>
                      <Input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Skriv inn PIN"
                        className="text-center text-2xl h-16 tracking-widest"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    
                    {/* PIN Pad */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                        <Button
                          key={digit}
                          type="button"
                          variant="outline"
                          className="h-16 text-2xl font-semibold"
                          onClick={() => handlePinPad(digit.toString())}
                        >
                          {digit}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-16 text-xl"
                        onClick={handleClear}
                      >
                        Slett
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-16 text-2xl font-semibold"
                        onClick={() => handlePinPad("0")}
                      >
                        0
                      </Button>
                      <Button
                        type="submit"
                        className="h-16 text-xl font-semibold bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                        disabled={pin.length < 4}
                      >
                        OK
                      </Button>
                    </div>
                  </form>
            </CardContent>
          </Card>
          
          {/* Currently Clocked In */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Pålogget Nå
              </CardTitle>
              <CardDescription>
                {clockedIn?.length || 0} ansatte er for øyeblikket stemplet inn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clockedIn && clockedIn.length > 0 ? (
                  clockedIn.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-amber-50 rounded-lg border border-purple-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{entry.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{entry.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Inn: {format(new Date(entry.clockIn), "HH:mm", { locale: nb })}
                        </p>
                        <p className="text-sm font-semibold text-purple-600">
                          {calculateDuration(entry.clockIn)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Ingen ansatte er stemplet inn</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Aktive Ansatte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {clockedIn?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Arbeidstid I Dag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {(() => {
                  const totalMinutes = clockedIn?.reduce((total, entry) => {
                    const diff = new Date().getTime() - new Date(entry.clockIn).getTime();
                    return total + Math.floor(diff / (1000 * 60));
                  }, 0) || 0;
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  return `${hours}t ${minutes}m`;
                })()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Produktivitet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {clockedIn && clockedIn.length > 0 ? "100%" : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </Layout>
  );
}
