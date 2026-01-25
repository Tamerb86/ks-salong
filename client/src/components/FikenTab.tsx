import { useState } from "react";
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
import { Loader2, Save, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { VerificationSection } from "@/components/VerificationSection";

export function FikenTab() {
  const { data: settings, refetch } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Fiken-innstillinger lagret!");
      refetch();
    },
    onError: (error) => {
      toast.error("Feil ved lagring: " + error.message);
    },
  });

  const testConnectionMutation = trpc.settings.testFikenConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Tilkoblingen til Fiken fungerer! ✓");
        setConnectionStatus("success");
      } else {
        toast.error("Kunne ikke koble til Fiken: " + result.message);
        setConnectionStatus("error");
      }
    },
    onError: (error) => {
      toast.error("Feil ved testing av tilkobling: " + error.message);
      setConnectionStatus("error");
    },
  });

  const syncDailyMutation = trpc.orders.syncDailyToFiken.useMutation({
    onSuccess: (result) => {
      if (result.synced > 0) {
        toast.success(`${result.synced} ordre synkronisert til Fiken!`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} ordre feilet. Sjekk loggene.`);
      }
      refetch();
    },
    onError: (error) => {
      toast.error("Feil ved synkronisering: " + error.message);
    },
  });

  const [fikenEnabled, setFikenEnabled] = useState(settings?.fikenEnabled ?? false);
  const [fikenApiToken, setFikenApiToken] = useState(settings?.fikenApiToken ?? "");
  const [fikenCompanySlug, setFikenCompanySlug] = useState(settings?.fikenCompanySlug ?? "");
  const [fikenAutoSync, setFikenAutoSync] = useState(settings?.fikenAutoSync ?? false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  // Update local state when settings load
  useState(() => {
    if (settings) {
      setFikenEnabled(settings.fikenEnabled ?? false);
      setFikenApiToken(settings.fikenApiToken ?? "");
      setFikenCompanySlug(settings.fikenCompanySlug ?? "");
      setFikenAutoSync(settings.fikenAutoSync ?? false);
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      fikenEnabled,
      fikenApiToken: fikenApiToken || undefined,
      fikenCompanySlug: fikenCompanySlug || undefined,
      fikenAutoSync,
    });
  };

  const handleTestConnection = () => {
    if (!fikenApiToken) {
      toast.error("Vennligst skriv inn API-nøkkel først");
      return;
    }
    setConnectionStatus("idle");
    testConnectionMutation.mutate({ apiToken: fikenApiToken });
  };

  const handleSyncToday = () => {
    const today = new Date().toISOString().split("T")[0];
    syncDailyMutation.mutate({ date: today });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fiken Regnskap Integrasjon</CardTitle>
          <CardDescription>
            Koble K.S Salong til Fiken.no for automatisk regnskapsføring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
            <div className="space-y-0.5">
              <Label htmlFor="fikenEnabled" className="text-base font-semibold">
                Aktiver Fiken-integrasjon
              </Label>
              <p className="text-sm text-gray-600">
                Synkroniser daglige salg til Fiken automatisk
              </p>
            </div>
            <Switch
              id="fikenEnabled"
              checked={fikenEnabled}
              onCheckedChange={setFikenEnabled}
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm text-blue-900 font-medium">
              📘 Før du starter:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Du må ha en Fiken-konto (opprett gratis på <a href="https://fiken.no" target="_blank" rel="noopener noreferrer" className="underline">fiken.no</a>)</li>
              <li>API-modulen koster 99 kr/måned i Fiken</li>
              <li>Aktiver API i Fiken: Rediger konto → API → Personlige API-nøkler</li>
              <li>Kopier API-nøkkelen og company slug (firmanavn i URL)</li>
            </ul>
          </div>

          {/* API Token */}
          <div className="space-y-2">
            <Label htmlFor="fikenApiToken">API-nøkkel (Personal API Token)</Label>
            <div className="flex gap-2">
              <Input
                id="fikenApiToken"
                type="password"
                placeholder="Din Fiken API-nøkkel"
                value={fikenApiToken}
                onChange={(e) => setFikenApiToken(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending || !fikenApiToken}
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connectionStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : connectionStatus === "error" ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Hentes fra: Rediger konto → API → Personlige API-nøkler
            </p>
          </div>

          {/* Company Slug */}
          <div className="space-y-2">
            <Label htmlFor="fikenCompanySlug">Company Slug (Firmanavn)</Label>
            <Input
              id="fikenCompanySlug"
              type="text"
              placeholder="mitt-firma"
              value={fikenCompanySlug}
              onChange={(e) => setFikenCompanySlug(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Finnes i URL når du er logget inn i Fiken: fiken.no/<strong>mitt-firma</strong>/dashboard
            </p>
          </div>

          {/* Auto Sync */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="fikenAutoSync" className="text-base">
                Automatisk synkronisering
              </Label>
              <p className="text-sm text-gray-500">
                Synkroniser salg til Fiken hver natt kl. 23:00
              </p>
            </div>
            <Switch
              id="fikenAutoSync"
              checked={fikenAutoSync}
              onCheckedChange={setFikenAutoSync}
            />
          </div>

          {/* Last Sync Info */}
          {settings?.fikenLastSyncDate && (
            <div className="p-3 bg-gray-50 border rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Siste synkronisering:</strong>{" "}
                {new Date(settings.fikenLastSyncDate).toLocaleString("nb-NO")}
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSyncToday}
              disabled={!fikenEnabled || !fikenApiToken || !fikenCompanySlug || syncDailyMutation.isPending}
            >
              {syncDailyMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <RefreshCw className="h-4 w-4 mr-2" />
              Synkroniser i dag
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              onClick={handleSave}
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

      {/* Manual Date Range Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Manuell synkronisering (datoområde)</CardTitle>
          <CardDescription>
            Synkroniser salg for et spesifikt datoområde til Fiken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="syncStartDate">Fra dato</Label>
              <Input
                id="syncStartDate"
                type="date"
                disabled={!fikenEnabled || !fikenApiToken || !fikenCompanySlug}
              />
            </div>
            <div>
              <Label htmlFor="syncEndDate">Til dato</Label>
              <Input
                id="syncEndDate"
                type="date"
                disabled={!fikenEnabled || !fikenApiToken || !fikenCompanySlug}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const startDate = (document.getElementById("syncStartDate") as HTMLInputElement)?.value;
                  const endDate = (document.getElementById("syncEndDate") as HTMLInputElement)?.value;
                  if (!startDate || !endDate) {
                    toast.error("Vennligst velg både fra- og til-dato");
                    return;
                  }
                  if (new Date(startDate) > new Date(endDate)) {
                    toast.error("Fra-dato kan ikke være etter til-dato");
                    return;
                  }
                  // TODO: Add manual date range sync mutation
                  toast.info("Synkroniserer " + startDate + " til " + endDate + "...");
                }}
                disabled={!fikenEnabled || !fikenApiToken || !fikenCompanySlug}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synkroniser periode
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="link"
              className="text-purple-600"
              onClick={() => window.open("/fiken-sync-history", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Se synkroniseringshistorikk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Verifiser totaler</CardTitle>
          <CardDescription>
            Sammenlign salg mellom K.S Salong og Fiken for å sikre nøyaktighet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationSection />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>Hvordan det fungerer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Salg registreres i K.S Salong</p>
                <p className="text-sm text-gray-600">
                  Alle ordre fra POS-systemet lagres lokalt med MVA-beregning
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Automatisk synkronisering til Fiken</p>
                <p className="text-sm text-gray-600">
                  Daglige salg sendes til Fiken med korrekt MVA (25%) og kontoføring
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Verifisering av totaler</p>
                <p className="text-sm text-gray-600">
                  Systemet sammenligner totaler mellom K.S Salong og Fiken for å sikre nøyaktighet
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" asChild>
              <a
                href="https://api.fiken.no/api/v2/docs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Fiken API Dokumentasjon
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
