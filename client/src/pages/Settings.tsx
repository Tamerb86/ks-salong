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
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

export default function Settings() {
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
  });

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
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              <p className="text-gray-600">Administrer salongens innstillinger</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Salon Information */}
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
            </CardContent>
          </Card>

          {/* Booking Settings */}
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
            </CardContent>
          </Card>

          {/* Payment Settings */}
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
            </CardContent>
          </Card>

          {/* Notification Settings */}
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
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Skatteinnstillinger</CardTitle>
              <CardDescription>MVA og avgifter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
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
        </form>
      </div>
    </div>
    </Layout>
  );
}
