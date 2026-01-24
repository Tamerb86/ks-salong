import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  Save, 
  Settings as SettingsIcon,
  Calendar,
  Bell,
  Users,
  BarChart3,
  Clock,
  Target,
  Briefcase,
  FileText,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

type TabId = "overview" | "google-calendar" | "notifications" | "booking" | "payment" | "staff" | "goals" | "workplan" | "conflicts" | "reports" | "history";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "overview", label: "Oversikt", icon: <SettingsIcon className="h-4 w-4" /> },
  { id: "google-calendar", label: "Google Calendar", icon: <Calendar className="h-4 w-4" /> },
  { id: "notifications", label: "Varsler", icon: <Bell className="h-4 w-4" /> },
  { id: "booking", label: "Booking", icon: <Clock className="h-4 w-4" /> },
  { id: "payment", label: "Betaling", icon: <DollarSign className="h-4 w-4" /> },
  { id: "staff", label: "Ansatte", icon: <Users className="h-4 w-4" /> },
  { id: "reports", label: "Rapporter", icon: <BarChart3 className="h-4 w-4" /> },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Innstillinger lagret!");
    },
    onError: (error) => {
      toast.error("Feil ved lagring: " + error.message);
    },
  });

  const [formData, setFormData] = useState({
    salonName: "",
    salonEmail: "",
    salonPhone: "",
    salonAddress: "",
    defaultMvaTax: "25.00",
    bookingSlotInterval: 15,
    bufferTimeBetweenAppointments: 5,
    cancellationPolicyHours: 24,
    reminder24hEnabled: true,
    reminder2hEnabled: true,
    vippsEnabled: false,
    requirePaymentForBooking: false,
    autoLogoutTime: "22:00",
  });

  // Google Calendar settings
  const [googleSyncEnabled, setGoogleSyncEnabled] = useState(false);
  const [autoSyncFrequency, setAutoSyncFrequency] = useState("15");
  const [syncNewAppointments, setSyncNewAppointments] = useState(true);
  const [syncChanges, setSyncChanges] = useState(true);
  const [syncDeletions, setSyncDeletions] = useState(true);
  const [includeCustomerDetails, setIncludeCustomerDetails] = useState(true);

  useEffect(() => {
    if (settings) {
      setFormData({
        salonName: settings.salonName || "",
        salonEmail: settings.salonEmail || "",
        salonPhone: settings.salonPhone || "",
        salonAddress: settings.salonAddress || "",
        defaultMvaTax: settings.defaultMvaTax || "25.00",
        bookingSlotInterval: settings.bookingSlotInterval || 15,
        bufferTimeBetweenAppointments: settings.bufferTimeBetweenAppointments || 5,
        cancellationPolicyHours: settings.cancellationPolicyHours || 24,
        reminder24hEnabled: settings.reminder24hEnabled ?? true,
        reminder2hEnabled: settings.reminder2hEnabled ?? true,
        vippsEnabled: settings.vippsEnabled ?? false,
        requirePaymentForBooking: settings.requirePaymentForBooking ?? false,
        autoLogoutTime: settings.autoLogoutTime || "22:00",
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-600 rounded-xl">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Innstillinger
                </h1>
                <p className="text-gray-600">Administrer systeminnstillinger og preferanser</p>
              </div>
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                    border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle>Salonginformasjon</CardTitle>
                  <CardDescription>Grunnleggende informasjon om salonen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="salonName">Salonnavn</Label>
                    <Input
                      id="salonName"
                      value={formData.salonName}
                      onChange={(e) =>
                        setFormData({ ...formData, salonName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonEmail">E-post</Label>
                    <Input
                      id="salonEmail"
                      type="email"
                      value={formData.salonEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, salonEmail: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonPhone">Telefon</Label>
                    <Input
                      id="salonPhone"
                      value={formData.salonPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, salonPhone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonAddress">Adresse</Label>
                    <Input
                      id="salonAddress"
                      value={formData.salonAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, salonAddress: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultMvaTax">Standard MVA (%)</Label>
                    <Input
                      id="defaultMvaTax"
                      value={formData.defaultMvaTax}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultMvaTax: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "google-calendar" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Google Calendar-integrasjon
                  </CardTitle>
                  <CardDescription>
                    Synkroniser avtaler automatisk med Google Calendar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="googleSyncEnabled" className="text-base">
                        Aktiver Google Calendar-synkronisering
                      </Label>
                      <p className="text-sm text-gray-500">
                        Synkroniser avtaler automatisk med Google Calendar
                      </p>
                    </div>
                    <Switch
                      id="googleSyncEnabled"
                      checked={googleSyncEnabled}
                      onCheckedChange={setGoogleSyncEnabled}
                    />
                  </div>

                  {googleSyncEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="autoSyncFrequency">Synkroniseringsfrekvens</Label>
                        <select
                          id="autoSyncFrequency"
                          value={autoSyncFrequency}
                          onChange={(e) => setAutoSyncFrequency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="5">Hver 5. minutt</option>
                          <option value="15">Hver 15. minutt</option>
                          <option value="30">Hver 30. minutt</option>
                          <option value="60">Hver time</option>
                        </select>
                        <p className="text-sm text-gray-500">
                          Hvor ofte skal avtaler synkroniseres med Google Calendar
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Synkroniseringsalternativer</h3>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label>Synkroniser nye avtaler</Label>
                            <p className="text-sm text-gray-500">
                              Legg til nye avtaler automatisk i Google Calendar
                            </p>
                          </div>
                          <Switch
                            checked={syncNewAppointments}
                            onCheckedChange={setSyncNewAppointments}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label>Synkroniser endringer</Label>
                            <p className="text-sm text-gray-500">
                              Oppdater Google Calendar når avtaler endres
                            </p>
                          </div>
                          <Switch
                            checked={syncChanges}
                            onCheckedChange={setSyncChanges}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label>Synkroniser slettinger</Label>
                            <p className="text-sm text-gray-500">
                              Fjern avtaler fra Google Calendar når de kanselleres
                            </p>
                          </div>
                          <Switch
                            checked={syncDeletions}
                            onCheckedChange={setSyncDeletions}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label>Inkluder kundedetaljer</Label>
                            <p className="text-sm text-gray-500">
                              Legg til kundenavn og kontaktinfo i kalenderhendelser
                            </p>
                          </div>
                          <Switch
                            checked={includeCustomerDetails}
                            onCheckedChange={setIncludeCustomerDetails}
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h3 className="font-medium flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4" />
                          Tilkoblingsstatus
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Status: <span className="text-yellow-600 font-medium">Ikke tilkoblet</span>
                        </p>
                        <Button variant="outline" size="sm" type="button">
                          Koble til Google Calendar
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => toast.success("Google Calendar-innstillinger lagret!")}
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Varslingsinnstillinger</CardTitle>
                  <CardDescription>Konfigurer automatiske påminnelser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder24h" className="text-base">
                        24-timers påminnelse
                      </Label>
                      <p className="text-sm text-gray-500">
                        Send påminnelse 24 timer før avtale
                      </p>
                    </div>
                    <Switch
                      id="reminder24h"
                      checked={formData.reminder24hEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, reminder24hEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder2h" className="text-base">
                        2-timers påminnelse
                      </Label>
                      <p className="text-sm text-gray-500">
                        Send påminnelse 2 timer før avtale
                      </p>
                    </div>
                    <Switch
                      id="reminder2h"
                      checked={formData.reminder2hEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, reminder2hEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "booking" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bookinginnstillinger</CardTitle>
                  <CardDescription>Konfigurer bookingsystemet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingSlotInterval">Tidsintervall (minutter)</Label>
                    <Input
                      id="bookingSlotInterval"
                      type="number"
                      value={formData.bookingSlotInterval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingSlotInterval: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bufferTimeBetweenAppointments">
                      Buffertid mellom avtaler (minutter)
                    </Label>
                    <Input
                      id="bufferTimeBetweenAppointments"
                      type="number"
                      value={formData.bufferTimeBetweenAppointments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bufferTimeBetweenAppointments: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicyHours">
                      Avbestillingsvarsel (timer)
                    </Label>
                    <Input
                      id="cancellationPolicyHours"
                      type="number"
                      value={formData.cancellationPolicyHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancellationPolicyHours: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Betalingsinnstillinger</CardTitle>
                  <CardDescription>
                    Konfigurer betalingsalternativer for online booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="vippsEnabled" className="text-base">
                        Aktiver Vipps
                      </Label>
                      <p className="text-sm text-gray-500">
                        Tillat betaling med Vipps
                      </p>
                    </div>
                    <Switch
                      id="vippsEnabled"
                      checked={formData.vippsEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, vippsEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePaymentForBooking" className="text-base">
                        Krev betaling ved online booking
                      </Label>
                      <p className="text-sm text-gray-500">
                        Kunder må betale før bookingen bekreftes (forhindrer no-show)
                      </p>
                    </div>
                    <Switch
                      id="requirePaymentForBooking"
                      checked={formData.requirePaymentForBooking}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requirePaymentForBooking: checked })
                      }
                    />
                  </div>

                  {formData.requirePaymentForBooking && !formData.vippsEnabled && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Du må aktivere Vipps for å kreve betaling ved booking
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "staff" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ansattinnstillinger</CardTitle>
                  <CardDescription>
                    Konfigurer tidsstempling og automatisk utlogging
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="autoLogoutTime">Automatisk utlogging klokkeslett</Label>
                    <Input
                      id="autoLogoutTime"
                      type="time"
                      value={formData.autoLogoutTime}
                      onChange={(e) =>
                        setFormData({ ...formData, autoLogoutTime: e.target.value })
                      }
                      className="max-w-xs"
                    />
                    <p className="text-sm text-gray-500">
                      Alle innloggede ansatte vil automatisk logges ut på dette tidspunktet (standard 22:00)
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Administrer ansatte fra <a href="/staff" className="underline font-medium">Ansatte-siden</a>
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Lagre innstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "reports" && (
              <Card>
                <CardHeader>
                  <CardTitle>Rapporter</CardTitle>
                  <CardDescription>
                    Administrer rapportinnstillinger
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Se og generer rapporter fra <a href="/reports" className="underline font-medium">Rapporter-siden</a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
