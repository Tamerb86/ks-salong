import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Download, FileSpreadsheet, FileText, Search, TrendingUp, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/ui/live-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Sales() {
  
  
  // Filter states - MUST declare all hooks before any conditional returns
  const [dateFrom, setDateFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch data
  const { data: staff = [] } = trpc.staff.list.useQuery(undefined, { enabled: true });
  
  const { data: sales = [], isLoading, refetch } = trpc.orders.list.useQuery({
      dateFrom,
      dateTo,
      staffId: selectedEmployee === "all" ? undefined : parseInt(selectedEmployee),
      paymentMethod: selectedPaymentMethod === "all" ? undefined : selectedPaymentMethod,
    },
    { enabled: true, refetchInterval: 30000 }
  );
  
  const { data: profitability, isLoading: profitLoading } = trpc.orders.getProfitability.useQuery({
      dateFrom,
      dateTo,
      staffId: selectedEmployee === "all" ? undefined : parseInt(selectedEmployee),
      paymentMethod: selectedPaymentMethod === "all" ? undefined : selectedPaymentMethod,
    },
    { enabled: true, refetchInterval: 30000 }
  );
  
  const refundMutation = trpc.orders.refund.useMutation({
    onSuccess: () => {
      toast.success("Refund behandlet");
      setRefundDialogOpen(false);
      setRefundReason("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Ordre slettet");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Calculate statistics
  const totalSales = sales.reduce((sum: number, order: any) => sum + parseFloat(order.total || "0"), 0);
  const totalTransactions = sales.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const totalMVA = sales.reduce((sum: number, order: any) => sum + parseFloat(order.taxAmount || "0"), 0);
  
  // Filter by search query
  const filteredOrders = sales.filter((order: any) => 
    searchQuery === "" || 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExportExcel = () => {
    // Prepare data for Excel
    const exportData = filteredOrders.map((order: any) => ({
      'Ordre nr.': order.orderNumber,
      'Dato': format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm', { locale: nb }),
      'Ansatt': staff.find((s: any) => s.id === order.staffId)?.name || 'Ukjent',
      'Betalingsmetode': order.paymentMethod === 'cash' ? 'Kontant' : 
                         order.paymentMethod === 'card' ? 'Kort' :
                         order.paymentMethod === 'vipps' ? 'Vipps' : order.paymentMethod,
      'Subtotal (kr)': parseFloat(order.subtotal || '0').toFixed(2),
      'MVA 25% (kr)': parseFloat(order.taxAmount || '0').toFixed(2),
      'Totalt (kr)': parseFloat(order.total || '0').toFixed(2),
      'Status': order.status === 'completed' ? 'Fullført' :
                order.status === 'refunded' ? 'Refundert' : order.status,
      'Notater': order.notes || ''
    }));
    
    // Add summary row
    exportData.push({} as any);
    exportData.push({
      'Ordre nr.': 'SAMMENDRAG',
      'Dato': '',
      'Ansatt': '',
      'Betalingsmetode': '',
      'Subtotal (kr)': '',
      'MVA 25% (kr)': totalMVA.toFixed(2),
      'Totalt (kr)': totalSales.toFixed(2),
      'Status': `${totalTransactions} transaksjoner`,
      'Notater': `Gjennomsnitt: ${averageTransaction.toFixed(2)} kr`
    });
    
    // Add filter info
    const filterInfo = [
      { 'Filter': 'Fra dato', 'Verdi': dateFrom },
      { 'Filter': 'Til dato', 'Verdi': dateTo },
      { 'Filter': 'Ansatt', 'Verdi': selectedEmployee === 'all' ? 'Alle' : staff.find((s: any) => s.id === parseInt(selectedEmployee))?.name || 'Ukjent' },
      { 'Filter': 'Betalingsmetode', 'Verdi': selectedPaymentMethod === 'all' ? 'Alle' : selectedPaymentMethod }
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add filter sheet
    const wsFilter = XLSX.utils.json_to_sheet(filterInfo);
    XLSX.utils.book_append_sheet(wb, wsFilter, 'Filtre');
    
    // Add sales data sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Salg');
    
    // Generate filename with date
    const filename = `salg_${dateFrom}_til_${dateTo}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, filename);
    toast.success('Excel-fil lastet ned!');
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(128, 0, 128); // Purple
    doc.text('K.S Salong', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Salgsrapport', 14, 30);
    
    // Add filter information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let yPos = 40;
    doc.text(`Periode: ${dateFrom} til ${dateTo}`, 14, yPos);
    yPos += 6;
    doc.text(`Ansatt: ${selectedEmployee === 'all' ? 'Alle' : staff.find((s: any) => s.id === parseInt(selectedEmployee))?.name || 'Ukjent'}`, 14, yPos);
    yPos += 6;
    doc.text(`Betalingsmetode: ${selectedPaymentMethod === 'all' ? 'Alle' : selectedPaymentMethod}`, 14, yPos);
    yPos += 10;
    
    // Add summary statistics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sammendrag', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Totalt salg: ${totalSales.toFixed(2)} kr`, 14, yPos);
    yPos += 6;
    doc.text(`MVA (25%): ${totalMVA.toFixed(2)} kr`, 14, yPos);
    yPos += 6;
    doc.text(`Antall transaksjoner: ${totalTransactions}`, 14, yPos);
    yPos += 6;
    doc.text(`Gjennomsnitt per transaksjon: ${averageTransaction.toFixed(2)} kr`, 14, yPos);
    yPos += 10;
    
    // Prepare table data
    const tableData = filteredOrders.map((order: any) => [
      order.orderNumber,
      format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm', { locale: nb }),
      staff.find((s: any) => s.id === order.staffId)?.name || 'Ukjent',
      order.paymentMethod === 'cash' ? 'Kontant' : 
        order.paymentMethod === 'card' ? 'Kort' :
        order.paymentMethod === 'vipps' ? 'Vipps' : order.paymentMethod,
      `${parseFloat(order.total || '0').toFixed(2)} kr`,
      order.status === 'completed' ? 'Fullført' :
        order.status === 'refunded' ? 'Refundert' : order.status
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Ordre nr.', 'Dato', 'Ansatt', 'Betaling', 'Totalt', 'Status']],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [128, 0, 128], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 25 }
      }
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Side ${i} av ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Generert: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: nb })}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Generate filename and download
    const filename = `salgsrapport_${dateFrom}_til_${dateTo}.pdf`;
    doc.save(filename);
    toast.success('PDF-fil lastet ned!');
  };
  
  // Early returns AFTER all hooks
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Ingen tilgang</CardTitle>
            <CardDescription>Du må logge inn for å se denne siden</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <>
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Salg <LiveBadge />
              </h1>
              <p className="text-gray-600 mt-1">Oversikt over alle salg og transaksjoner</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Totalt salg</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold">{totalSales.toFixed(2)} kr</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Transaksjoner</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Gjennomsnitt</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold">{averageTransaction.toFixed(2)} kr</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">MVA (25%)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold">{totalMVA.toFixed(2)} kr</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Fortjeneste
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profitLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-green-700">{profitability?.totalProfit.toFixed(2) || "0.00"} kr</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Fortjenestemargin</CardTitle>
              </CardHeader>
              <CardContent>
                {profitLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-purple-700">{profitability?.profitMargin.toFixed(1) || "0.0"}%</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtre</CardTitle>
              <CardDescription>Filtrer salg etter dato, ansatt og betalingsmetode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Fra dato</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateTo">Til dato</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="employee">Ansatt</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Alle ansatte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle ansatte</SelectItem>
                      {staff.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Betalingsmetode</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Alle metoder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle metoder</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="vipps">Vipps</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search">Søk</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Fakturanr, notater..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sales List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksjoner ({filteredOrders.length})</CardTitle>
              <CardDescription>Alle salg i valgt periode</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Ingen transaksjoner funnet</p>
                  <p className="text-sm text-gray-500 mt-1">Prøv å endre filterene</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredOrders.map((order: any) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  {order.orderNumber}
                                </Badge>
                                <Badge
                                  variant={
                                    order.status === "completed" ? "default" :
                                    order.status === "refunded" ? "destructive" :
                                    order.status === "partially_refunded" ? "secondary" :
                                    "outline"
                                  }
                                >
                                  {order.status === "completed" && "Fullført"}
                                  {order.status === "pending" && "Venter"}
                                  {order.status === "refunded" && "Refundert"}
                                  {order.status === "partially_refunded" && "Delvis refundert"}
                                </Badge>
                                {order.paymentMethod && (
                                  <Badge variant="secondary">
                                    {order.paymentMethod.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Dato:</span>
                                  <p className="font-medium">
                                    {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm", { locale: nb })}
                                  </p>
                                </div>
                                
                                {order.staffName && (
                                  <div>
                                    <span className="text-gray-600">Ansatt:</span>
                                    <p className="font-medium">{order.staffName}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="text-gray-600">Delsum:</span>
                                  <p className="font-medium">{parseFloat(order.subtotal).toFixed(2)} kr</p>
                                </div>
                                
                                <div>
                                  <span className="text-gray-600">MVA:</span>
                                  <p className="font-medium">{parseFloat(order.taxAmount).toFixed(2)} kr</p>
                                </div>
                              </div>
                              
                              {order.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Notater:</span> {order.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-purple-600">
                                {parseFloat(order.total).toFixed(2)} kr
                              </p>
                              
                              <div className="flex flex-col gap-2">
                                {order.status !== "refunded" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setRefundDialogOpen(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Refund
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (confirm(`Er du sikker på at du vil slette ordre ${order.orderNumber}?`)) {
                                      deleteMutation.mutate(order.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Slett
                                </Button>
                              </div>
                              {parseFloat(order.discountAmount) > 0 && (
                                <p className="text-sm text-red-600">
                                  Rabatt: -{parseFloat(order.discountAmount).toFixed(2)} kr
                                </p>
                              )}
                              {parseFloat(order.tipAmount) > 0 && (
                                <p className="text-sm text-green-600">
                                  Tips: +{parseFloat(order.tipAmount).toFixed(2)} kr
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
    
    {/* Refund Dialog */}
    <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refunder ordre</DialogTitle>
          <DialogDescription>
            Skriv inn årsaken til refusjon. Produkter vil bli returnert til lageret.
          </DialogDescription>
        </DialogHeader>
        
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Ordre: {selectedOrder.orderNumber}</p>
              <p className="text-lg font-bold">{parseFloat(selectedOrder.total).toFixed(2)} kr</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Årsak til refusjon</label>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Beskriv årsaken til refusjon..."
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRefundDialogOpen(false);
                  setRefundReason("");
                }}
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!refundReason.trim()) {
                    toast.error("Vennligst skriv inn årsak");
                    return;
                  }
                  refundMutation.mutate({
                    orderId: selectedOrder.id,
                    reason: refundReason,
                  });
                }}
                disabled={refundMutation.isPending}
              >
                {refundMutation.isPending ? "Behandler..." : "Bekreft refusjon"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
