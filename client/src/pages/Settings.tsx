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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Calculator,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { FikenTab } from "@/components/FikenTab";
import { BusinessHoursTab } from "@/components/BusinessHoursTab";
import { QRCodeSVG } from "qrcode.react";

type TabId = "overview" | "google-calendar" | "notifications" | "booking" | "payment" | "staff" | "fiken" | "goals" | "workplan" | "conflicts" | "reports" | "history" | "business-hours" | "danger-zone";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "overview", label: "Oversikt", icon: <SettingsIcon className="h-4 w-4" /> },
  { id: "business-hours", label: "Åpningstider", icon: <Clock className="h-4 w-4" /> },
  { id: "google-calendar", label: "Google Calendar", icon: <Calendar className="h-4 w-4" /> },
  { id: "notifications", label: "Varsler", icon: <Bell className="h-4 w-4" /> },
  { id: "booking", label: "Booking", icon: <Clock className="h-4 w-4" /> },
  { id: "payment", label: "Betaling", icon: <DollarSign className="h-4 w-4" /> },
  { id: "staff", label: "Ansatte", icon: <Users className="h-4 w-4" /> },
  { id: "fiken", label: "Fiken Regnskap", icon: <Calculator className="h-4 w-4" /> },
  { id: "reports", label: "Rapporter", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "danger-zone", label: "Faresone", icon: <AlertTriangle className="h-4 w-4" /> },
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
    universalPin: "1234",
    customBookingUrl: "",
    receiptMessage: "",
    mvaNumber: "",
    bankAccountNumber: "",
    vippsTestMode: true,
    resendApiKey: "",
    resendFromEmail: "",
    resendFromName: "",
  });

  const [urlError, setUrlError] = useState("");

  const validateBookingUrl = (url: string): boolean => {
    if (!url || url.trim() === "") {
      setUrlError("");
      return true; // Empty is valid (will use default)
    }

    // Check if it's a full URL or just subdomain
    const urlPattern = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const subdomainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

    if (urlPattern.test(url) || subdomainPattern.test(url)) {
      setUrlError("");
      return true;
    } else {
      setUrlError("Ugyldig URL-format. Bruk enten full URL (https://...) eller subdomain (booking.domain.no)");
      return false;
    }
  };

  // Clear data dialog
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const clearDataMutation = trpc.settings.clearAllData.useMutation({
    onSuccess: () => {
      toast.success("Alle data er slettet! Systemet er nullstilt.");
      setShowClearDataDialog(false);
      setConfirmationText("");
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: (error) => {
      toast.error("Feil ved sletting: " + error.message);
    },
  });

  const seedDefaultDataMutation = trpc.settings.seedDefaultData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Standarddata lastet inn!");
      // Reload page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      toast.error("Feil ved lasting av standarddata: " + error.message);
    },
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
        universalPin: settings.universalPin || "1234",
        customBookingUrl: settings.customBookingUrl || "",
        receiptMessage: settings.receiptMessage || "",
        mvaNumber: settings.mvaNumber || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        vippsTestMode: settings.vippsTestMode ?? true,
        resendApiKey: settings.resendApiKey || "",
        resendFromEmail: settings.resendFromEmail || "",
        resendFromName: settings.resendFromName || "",
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

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Kvitteringsinnstillinger</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mvaNumber">MVA-nummer (org.nr.)</Label>
                        <Input
                          id="mvaNumber"
                          placeholder="NO 123 456 789 MVA"
                          value={formData.mvaNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, mvaNumber: e.target.value })
                          }
                        />
                        <p className="text-xs text-gray-500">Vises på kvitteringer og fakturaer</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="receiptMessage">Tilpasset melding på kvittering</Label>
                        <Input
                          id="receiptMessage"
                          placeholder="Takk for besøket! Velkommen tilbake!"
                          value={formData.receiptMessage}
                          onChange={(e) =>
                            setFormData({ ...formData, receiptMessage: e.target.value })
                          }
                        />
                        <p className="text-xs text-gray-500">Vises nederst på alle kvitteringer</p>
                      </div>
                    </div>
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

            {activeTab === "business-hours" && (
              <BusinessHoursTab />
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

                  {/* Booking Link Section */}
                  <div className="mt-6 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <Label className="text-base font-semibold text-purple-900">
                        Online Booking Link
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Tilpass booking-lenken din. La stå tom for å bruke standard lenke.
                    </p>
                    
                    {/* Custom URL Input */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="customBookingUrl" className="text-sm font-medium">
                        Egendefinert lenke (valgfritt)
                      </Label>
                      <Input
                        id="customBookingUrl"
                        value={formData.customBookingUrl}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          setFormData({ ...formData, customBookingUrl: newUrl });
                          validateBookingUrl(newUrl);
                        }}
                        placeholder="https://booking.ks-salong.no eller book.ks-salong.no"
                        className={`bg-white font-mono text-sm ${urlError ? 'border-red-500' : ''}`}
                      />
                      {urlError && (
                        <p className="text-xs text-red-600">
                          {urlError}
                        </p>
                      )}
                      {!urlError && (
                        <p className="text-xs text-gray-500">
                          Eksempel: https://booking.ks-salong.no eller book.ks-salong.no
                        </p>
                      )}
                    </div>

                    {/* Current Active Link */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Aktiv booking-lenke</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.customBookingUrl || `${window.location.origin}/book-online`}
                          readOnly
                          className="bg-white font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const linkToCopy = formData.customBookingUrl || `${window.location.origin}/book-online`;
                            navigator.clipboard.writeText(linkToCopy);
                            toast.success("Lenke kopiert!");
                          }}
                          className="shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="ml-2">Kopier</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* QR Code Section */}
                    <div className="mt-4 p-4 border-2 border-amber-200 rounded-lg bg-amber-50 qr-print-container">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <Label className="text-base font-semibold text-amber-900">
                          QR-kode for booking
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Skriv ut QR-koden og plasser den i salongen. Kunder kan skanne den for å booke time.
                      </p>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                          <QRCodeSVG 
                            value={formData.customBookingUrl || `${window.location.origin}/book-online`}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.print()}
                            className="w-full"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Skriv ut QR-kode
                          </Button>
                          <p className="text-xs text-gray-500">
                            Tips: Plasser QR-koden ved resepsjonen eller i venteområdet
                          </p>
                        </div>
                      </div>
                    </div>
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

                  {/* Stripe Settings Section */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Stripe Betalingsinnstillinger</h3>
                    
                    {/* Stripe Status */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">Status:</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Test Mode (Sandbox)
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Du bruker for øyeblikket Stripe test-miljø. Alle betalinger er simulerte.
                      </p>
                    </div>

                    {/* Sandbox Claim Warning */}
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-900 mb-1">Viktig: Krev Stripe Sandbox</h4>
                          <p className="text-sm text-amber-700 mb-3">
                            Du må kreve Stripe sandbox før <strong>26. mars 2026</strong> for å aktivere test-miljøet.
                          </p>
                          <a
                            href="https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU3MzTUk1QTQ4TVdTa2wxLDE3Njk5ODg0NzEv1003jr9Z8zG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            Krev Stripe Sandbox →
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Test Card Info */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <h4 className="font-medium text-green-900 mb-2">Test-kortnummer</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Bruk dette kortnummeret for å teste betalinger i test-miljøet:
                      </p>
                      <div className="bg-white p-3 rounded border border-green-300 font-mono text-sm">
                        4242 4242 4242 4242
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Bruk hvilken som helst fremtidig dato for utløp og hvilken som helst 3-sifret CVC.
                      </p>
                    </div>

                    {/* Stripe Dashboard Link */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Stripe Dashboard</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Administrer betalinger, vis transaksjoner og konfigurer webhooks i Stripe Dashboard.
                      </p>
                      <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Åpne Stripe Dashboard →
                      </a>
                    </div>

                  {/* Live Mode Instructions */}
                  <div className="p-4 bg-gray-50 border rounded-lg mt-4">
                    <h4 className="font-medium mb-2">Bytt til Live Mode</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      For å aktivere ekte betalinger:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Fullfør Stripe KYC (Know Your Customer) verifisering</li>
                      <li>Gå til Settings → Payment i Manus Management UI</li>
                      <li>Legg inn dine live API-nøkler</li>
                      <li>Test med 99% rabattkode (minimum 0.50 USD påkrevd)</li>
                    </ol>
                  </div>

                  {/* Bank Account Section */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">Bankkonto for utbetalinger</h4>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Norsk kontonummer (11 siffer)</Label>
                      <Input
                        id="bankAccountNumber"
                        placeholder="12345678901"
                        maxLength={11}
                        value={formData.bankAccountNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, bankAccountNumber: value });
                        }}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-gray-500">Brukes for utbetalinger fra Stripe og Vipps</p>
                    </div>
                  </div>
                </div>

                {/* Vipps Settings Section */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Vipps Betalingsinnstillinger</h3>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-orange-900">Status:</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {formData.vippsTestMode ? 'Test Mode (MT)' : 'Production Mode'}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      {formData.vippsTestMode 
                        ? 'Du bruker Vipps test-miljø (MT). Alle betalinger er simulerte.'
                        : 'Du bruker Vipps produksjonsmiljø. Ekte betalinger aktivert.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="vippsTestMode" className="text-base">
                          Test Mode (MT)
                        </Label>
                        <p className="text-sm text-gray-500">
                          Bruk Vipps test-miljø for testing
                        </p>
                      </div>
                      <Switch
                        id="vippsTestMode"
                        checked={formData.vippsTestMode}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, vippsTestMode: checked })
                        }
                      />
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Vipps Credentials</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Konfigurer Vipps API-nøkler i Manus Management UI under Settings → Payment.
                      </p>
                      <a
                        href="https://portal.vipps.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Åpne Vipps Portal →
                      </a>
                    </div>

                    <div className="p-4 bg-gray-50 border rounded-lg">
                      <h4 className="font-medium mb-2">Kom i gang med Vipps</h4>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Registrer deg på <a href="https://portal.vipps.no" target="_blank" rel="noopener noreferrer" className="underline">Vipps Portal</a></li>
                        <li>Opprett en Vipps-app (test eller produksjon)</li>
                        <li>Hent Client ID, Client Secret, Merchant Serial Number, og Subscription Key</li>
                        <li>Legg inn credentials i Manus Management UI → Settings → Payment</li>
                        <li>Test betalinger med Vipps test-app</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Resend Email Settings Section */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">E-post Innstillinger (Resend)</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resendApiKey">Resend API Key</Label>
                      <Input
                        id="resendApiKey"
                        type="password"
                        placeholder="re_xxxxxxxxxxxx"
                        value={formData.resendApiKey}
                        onChange={(e) =>
                          setFormData({ ...formData, resendApiKey: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">Hent fra <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">Resend Dashboard</a></p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resendFromEmail">Fra E-post</Label>
                      <Input
                        id="resendFromEmail"
                        type="email"
                        placeholder="noreply@ks-salong.no"
                        value={formData.resendFromEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, resendFromEmail: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">E-postadressen som vises som avsender</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resendFromName">Fra Navn</Label>
                      <Input
                        id="resendFromName"
                        placeholder="K.S Salong"
                        value={formData.resendFromName}
                        onChange={(e) =>
                          setFormData({ ...formData, resendFromName: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500">Navnet som vises som avsender</p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Kom i gang med Resend</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Registrer deg på <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">Resend.com</a></li>
                        <li>Verifiser ditt domene (f.eks. ks-salong.no)</li>
                        <li>Opprett en API-nøkkel</li>
                        <li>Legg inn credentials ovenfor</li>
                        <li>Test ved å sende en test-e-post</li>
                      </ol>
                    </div>
                  </div>
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
                    <Label htmlFor="universalPin">Felles PIN-kode</Label>
                    <Input
                      id="universalPin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.universalPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, universalPin: value });
                      }}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-gray-500">
                      Alle ansatte bruker samme PIN for å logge inn. Etter PIN-innlogging velger de sitt navn.
                    </p>
                  </div>
                  
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

            {activeTab === "fiken" && (
              <FikenTab />
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

            {activeTab === "danger-zone" && (
              <Card className="border-red-300">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Faresone
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    Disse handlingene kan ikke angres. Vær ekstremt forsiktig!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Clear All Data Section */}
                  <div className="border-2 border-red-300 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-600 rounded-lg">
                        <Trash2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                          Slett alle data
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                          Dette vil permanent slette alle transaksjonsdata:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1 mb-4 ml-4 list-disc">
                          <li>Alle avtaler (bookinger)</li>
                          <li>Alle kunder</li>
                          <li>Alle ordrer og salg</li>
                          <li>Alle betalinger</li>
                          <li>Alle tidsstempler</li>
                          <li>Drop-in kø</li>
                          <li>Alle rapporter og logger</li>
                        </ul>
                        <div className="p-3 bg-green-50 border border-green-300 rounded-lg mb-4">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Følgende data vil bli BEHOLDT:
                          </p>
                          <ul className="text-sm text-green-700 mt-2 ml-4 list-disc">
                            <li>Tjenester og produkter</li>
                            <li>Ansatte (inkludert eier)</li>
                            <li>Salonginformasjon og innstillinger</li>
                            <li>Åpningstider</li>
                          </ul>
                        </div>
                        <p className="text-sm text-red-800 font-semibold mb-4">
                          ⚠️ ADVARSEL: Denne handlingen kan IKKE angres!
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setShowClearDataDialog(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Slett alle data
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Seed Default Data Section */}
                  <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-purple-900 mb-2">
                          Last inn standarddata
                        </h3>
                        <p className="text-sm text-purple-700 mb-4">
                          Legg til populære frisørtjenester og produkter:
                        </p>
                        <ul className="text-sm text-purple-700 space-y-1 mb-4 ml-4 list-disc">
                          <li>10 tjenester (Herreklipp, Dameklipp, Farging, Highlights, osv.)</li>
                          <li>10 produkter (Shampoo, Conditioner, Wax, Spray, osv.)</li>
                        </ul>
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => seedDefaultDataMutation.mutate()}
                          disabled={seedDefaultDataMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {seedDefaultDataMutation.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          <Briefcase className="h-4 w-4 mr-2" />
                          Last inn standarddata
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tips:</strong> Last inn standarddata først, deretter slett testdata før produksjon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>

          {/* Clear Data Confirmation Dialog */}
          <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                  Er du helt sikker?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p className="text-base font-semibold text-red-600">
                    Denne handlingen vil PERMANENT slette alle transaksjonsdata!
                  </p>
                  <p className="text-sm text-gray-700">
                    Følgende data vil bli slettet:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Alle avtaler (bookinger) - {"inkludert fremtidige avtaler"}</li>
                    <li>Alle kunder - {"inkludert kontaktinformasjon og historikk"}</li>
                    <li>Alle ordrer og salg - {"inkludert inntektsdata"}</li>
                    <li>Alle betalinger - {"inkludert transaksjonshistorikk"}</li>
                    <li>Alle tidsstempler - {"inkludert arbeidstimer"}</li>
                    <li>Drop-in kø - {"alle ventende kunder"}</li>
                    <li>Alle rapporter og logger</li>
                  </ul>
                  <p className="text-sm text-green-700 font-semibold mt-3">
                    ✓ Følgende data vil bli BEHOLDT:
                  </p>
                  <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc">
                    <li>Tjenester og produkter - {"inkludert priser"}</li>
                    <li>Ansatte - {"inkludert eier-kontoen"}</li>
                    <li>Innstillinger og åpningstider</li>
                  </ul>
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm text-red-800 font-bold">
                      ⚠️ DENNE HANDLINGEN KAN IKKE ANGRES!
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                      Det finnes ingen måte å gjenopprette dataene etter sletting.
                    </p>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="confirmText" className="text-base font-semibold">
                      Skriv <span className="font-mono bg-red-100 px-2 py-1 rounded">DELETE ALL DATA</span> for å bekrefte:
                    </Label>
                    <Input
                      id="confirmText"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Skriv DELETE ALL DATA her"
                      className="font-mono"
                      autoComplete="off"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setConfirmationText("");
                  setShowClearDataDialog(false);
                }}>
                  Avbryt
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmationText === "DELETE ALL DATA") {
                      clearDataMutation.mutate({ confirmation: "DELETE ALL DATA" });
                    } else {
                      toast.error("Du må skrive 'DELETE ALL DATA' for å bekrefte");
                    }
                  }}
                  disabled={confirmationText !== "DELETE ALL DATA" || clearDataMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {clearDataMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ja, slett alt permanent
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
}
