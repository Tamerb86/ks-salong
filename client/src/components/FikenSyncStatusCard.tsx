import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function FikenSyncStatusCard() {
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: lastSync, isLoading } = trpc.settings.getFikenSyncLogs.useQuery(
    { limit: 1 },
    { enabled: !!settings?.fikenEnabled }
  );
  
  const syncMutation = trpc.orders.syncTodaySalesToFiken.useMutation({
    onSuccess: () => {
      toast.success("Synkronisering startet!");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Don't show card if Fiken is not enabled
  if (!settings?.fikenEnabled) {
    return null;
  }

  const lastSyncRecord = lastSync?.[0];

  return (
    <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              Fiken Synkronisering
            </CardTitle>
            <CardDescription>Status for regnskapssystem</CardDescription>
          </div>
          <Link href="/fiken-sync-history">
            <Button variant="outline" size="sm" className="gap-2">
              Se historikk
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : lastSyncRecord ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {lastSyncRecord.status === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {lastSyncRecord.status === "success" ? "Siste synkronisering vellykket" : "Siste synkronisering mislyktes"}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(lastSyncRecord.createdAt), "dd.MM.yyyy 'kl.' HH:mm", { locale: nb })}
                </p>
              </div>
            </div>
            
            {lastSyncRecord.status === "success" && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-purple-200">
                <div>
                  <p className="text-sm text-gray-600">Antall salg</p>
                  <p className="text-2xl font-bold text-purple-600">{lastSyncRecord.salesCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Totalt beløp</p>
                  <p className="text-2xl font-bold text-purple-600">{lastSyncRecord.totalAmount ? parseFloat(lastSyncRecord.totalAmount).toFixed(2) : "0.00"} kr</p>
                </div>
              </div>
            )}
            
            {lastSyncRecord.status === "failure" && lastSyncRecord.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{lastSyncRecord.errorMessage}</p>
              </div>
            )}
            
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Synkroniserer...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synkroniser nå
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Ingen synkronisering ennå</p>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Synkroniserer...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start første synkronisering
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
