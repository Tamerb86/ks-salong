import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Filter,
  Download,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";

type PaymentStatus = "pending" | "initiated" | "authorized" | "captured" | "refunded" | "failed" | "cancelled" | "expired";

export default function PaymentHistory() {
  const { user, loading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Fetch all payments
  const { data: payments, isLoading, refetch } = trpc.payments.list.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    method: methodFilter === "all" ? undefined : methodFilter,
  });

  const handleShowReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const handlePrintReceipt = () => {
    if (!selectedPayment) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Kunne ikke åpne utskriftsvindu");
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kvittering - ${selectedPayment.id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 20px auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            font-weight: bold;
            font-size: 1.2em;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Khalid Salong</h2>
          <p>Kvittering</p>
        </div>
        
        <div class="row">
          <span>Dato:</span>
          <span>${format(new Date(selectedPayment.createdAt), "dd.MM.yyyy HH:mm", { locale: nb })}</span>
        </div>
        
        <div class="row">
          <span>Kvittering nr:</span>
          <span>#${selectedPayment.id}</span>
        </div>
        
        ${selectedPayment.customerName ? `
        <div class="row">
          <span>Kunde:</span>
          <span>${selectedPayment.customerName}</span>
        </div>
        ` : ""}
        
        ${selectedPayment.appointmentId ? `
        <div class="row">
          <span>Avtale:</span>
          <span>#${selectedPayment.appointmentId}</span>
        </div>
        ` : ""}
        
        <div class="row">
          <span>Betalingsmetode:</span>
          <span>${selectedPayment.method === "stripe" ? "Stripe Terminal" : selectedPayment.method}</span>
        </div>
        
        <div class="row total">
          <span>Totalt:</span>
          <span>${parseFloat(selectedPayment.amount).toFixed(2)} ${selectedPayment.currency}</span>
        </div>
        
        <div class="footer">
          <p>Takk for besøket!</p>
          <p>Khalid Salong - Porsgrunn</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      captured: { label: "Betalt", className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { label: "Venter", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      initiated: { label: "Startet", className: "bg-blue-100 text-blue-800", icon: Clock },
      authorized: { label: "Autorisert", className: "bg-blue-100 text-blue-800", icon: CheckCircle },
      failed: { label: "Mislyktes", className: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { label: "Kansellert", className: "bg-gray-100 text-gray-800", icon: XCircle },
      refunded: { label: "Refundert", className: "bg-purple-100 text-purple-800", icon: DollarSign },
      expired: { label: "Utløpt", className: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig: Record<string, { label: string; className: string }> = {
      stripe: { label: "Stripe Terminal", className: "bg-purple-100 text-purple-800" },
      vipps: { label: "Vipps", className: "bg-orange-100 text-orange-800" },
      cash: { label: "Kontant", className: "bg-green-100 text-green-800" },
      gift_card: { label: "Gavekort", className: "bg-pink-100 text-pink-800" },
    };

    const config = methodConfig[method] || { label: method, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const calculateStats = () => {
    if (!payments || payments.length === 0) {
      return { total: 0, count: 0, average: 0 };
    }

    const capturedPayments = payments.filter((p: any) => p.status === "captured");
    const total = capturedPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    const count = capturedPayments.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  };

  const stats = calculateStats();

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
            <p>Vennligst logg inn for å se betalingshistorikk.</p>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                Betalingshistorikk
              </h1>
              <p className="text-gray-600 mt-1">Oversikt over alle betalinger</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totalt innbetalt</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.toFixed(2)} kr</div>
                <p className="text-xs text-muted-foreground">Kun betalte transaksjoner</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Antall betalinger</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.count}</div>
                <p className="text-xs text-muted-foreground">Vellykkede transaksjoner</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gjennomsnitt</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average.toFixed(2)} kr</div>
                <p className="text-xs text-muted-foreground">Per transaksjon</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtrer betalinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Fra dato</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Til dato</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Alle statuser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statuser</SelectItem>
                      <SelectItem value="captured">Betalt</SelectItem>
                      <SelectItem value="pending">Venter</SelectItem>
                      <SelectItem value="failed">Mislyktes</SelectItem>
                      <SelectItem value="refunded">Refundert</SelectItem>
                      <SelectItem value="cancelled">Kansellert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method-filter">Betalingsmetode</Label>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger id="method-filter">
                      <SelectValue placeholder="Alle metoder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle metoder</SelectItem>
                      <SelectItem value="stripe">Stripe Terminal</SelectItem>
                      <SelectItem value="vipps">Vipps</SelectItem>
                      <SelectItem value="cash">Kontant</SelectItem>
                      <SelectItem value="gift_card">Gavekort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("all");
                    setMethodFilter("all");
                  }}
                >
                  Nullstill filtre
                </Button>
                <Button onClick={() => refetch()}>
                  <Search className="h-4 w-4 mr-2" />
                  Søk
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Betalinger</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : payments && payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Dato & Tid</TableHead>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Beløp</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Avtale</TableHead>
                      <TableHead className="text-right">Handlinger</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">#{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {format(new Date(payment.createdAt), "d. MMM yyyy", { locale: nb })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(payment.createdAt), "HH:mm")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.customerName || <span className="text-gray-400">Ingen kunde</span>}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">
                            {parseFloat(payment.amount).toFixed(2)} {payment.currency}
                          </span>
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.appointmentId ? (
                            <span className="text-sm text-blue-600">#{payment.appointmentId}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowReceipt(payment)}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Ingen betalinger funnet</p>
                  <p className="text-sm mt-2">Juster filtrene eller vent på nye transaksjoner</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Dialog */}
          <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-purple-600" />
                  Kvittering
                </DialogTitle>
                <DialogDescription>
                  Betalingsdetaljer for transaksjon #{selectedPayment?.id}
                </DialogDescription>
              </DialogHeader>

              {selectedPayment && (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dato:</span>
                    <span className="font-medium">
                      {format(new Date(selectedPayment.createdAt), "d. MMMM yyyy HH:mm", { locale: nb })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Beløp:</span>
                    <span className="font-bold text-lg text-green-600">
                      {parseFloat(selectedPayment.amount).toFixed(2)} {selectedPayment.currency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Metode:</span>
                    {getMethodBadge(selectedPayment.method)}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(selectedPayment.status)}
                  </div>

                  {selectedPayment.customerName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kunde:</span>
                      <span className="font-medium">{selectedPayment.customerName}</span>
                    </div>
                  )}

                  {selectedPayment.appointmentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avtale:</span>
                      <span className="text-blue-600">#{selectedPayment.appointmentId}</span>
                    </div>
                  )}

                  {selectedPayment.providerTransactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaksjons-ID:</span>
                      <span className="text-xs font-mono">{selectedPayment.providerTransactionId}</span>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
                  Lukk
                </Button>
                <Button onClick={handlePrintReceipt} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Skriv ut
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
