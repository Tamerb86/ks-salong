import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

export default function FikenSyncHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: logs, isLoading, refetch } = trpc.settings.getFikenSyncLogs.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Vellykket
          </Badge>
        );
      case "failure":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Mislyktes
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pågår
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSyncTypeBadge = (type: string) => {
    return type === "automatic" ? (
      <Badge variant="outline">Automatisk</Badge>
    ) : (
      <Badge variant="secondary">Manuell</Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      toast.error("Det er ingen synkroniseringslogger å eksportere");
      return;
    }

    const headers = ["Dato", "Starttid", "Sluttid", "Status", "Type", "Antall salg", "Totalbeløp", "Feilmelding"];
    const rows = logs.map((log: any) => [
      log.syncDate,
      formatTime(log.startTime),
      formatTime(log.endTime),
      log.status,
      log.syncType,
      log.salesCount || 0,
      `${log.totalAmount || 0} kr`,
      log.errorMessage || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fiken-sync-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Synkroniseringslogger er eksportert til CSV");
  };

  const filteredLogs = logs?.filter((log: any) => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log.syncDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && logDate < start) return false;
    if (end && logDate > end) return false;
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fiken Synkroniseringshistorikk</h1>
        <p className="text-muted-foreground mt-2">
          Oversikt over alle synkroniseringer mellom Khalid Salong og Fiken
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrer og eksporter</CardTitle>
          <CardDescription>Velg datoområde for å filtrere synkroniseringslogger</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Fra dato</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Til dato</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Tilbakestill
              </Button>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Oppdater
              </Button>
              <Button onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Eksporter CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synkroniseringslogger</CardTitle>
          <CardDescription>
            Totalt {filteredLogs?.length || 0} synkroniseringer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Laster...</div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dato</TableHead>
                    <TableHead>Starttid</TableHead>
                    <TableHead>Sluttid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Antall salg</TableHead>
                    <TableHead className="text-right">Totalbeløp</TableHead>
                    <TableHead>Feilmelding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDate(log.syncDate)}</TableCell>
                      <TableCell>{formatTime(log.startTime)}</TableCell>
                      <TableCell>{formatTime(log.endTime)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{getSyncTypeBadge(log.syncType)}</TableCell>
                      <TableCell className="text-right">{log.salesCount || 0}</TableCell>
                      <TableCell className="text-right">{log.totalAmount || 0} kr</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.errorMessage || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen synkroniseringslogger funnet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
