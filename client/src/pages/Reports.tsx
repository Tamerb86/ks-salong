import { trpc } from "@/lib/trpc";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar, Clock, TrendingUp, Users, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("today");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  
  const { data: staff } = trpc.staff.list.useQuery();
  
  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    switch (dateRange) {
      case "today":
        return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
      case "week":
        return {
          from: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          to: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        };
      case "month":
        return {
          from: format(startOfMonth(today), "yyyy-MM-dd"),
          to: format(endOfMonth(today), "yyyy-MM-dd"),
        };
    }
  };
  
  const { from, to } = getDateRange();
  
  const { data: timeEntries, isLoading } = trpc.timeTracking.getTimeReport.useQuery({
    from,
    to,
    employeeId: selectedEmployee === "all" ? undefined : parseInt(selectedEmployee),
  });
  
  // Get sales without customer data
  const { data: salesWithoutCustomer } = trpc.orders.getSalesWithoutCustomer.useQuery({
    dateFrom: from,
    dateTo: to,
  });
  
  // Calculate totals
  const calculateTotals = () => {
    if (!timeEntries) return { totalHours: 0, regularHours: 0, overtimeHours: 0 };
    
    let totalMinutes = 0;
    let overtimeMinutes = 0;
    
    timeEntries.forEach((entry: any) => {
      const minutes = entry.totalMinutes || 0;
      totalMinutes += minutes;
      if (entry.isWeekend) {
        overtimeMinutes += minutes;
      }
    });
    
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      regularHours: ((totalMinutes - overtimeMinutes) / 60).toFixed(1),
      overtimeHours: (overtimeMinutes / 60).toFixed(1),
    };
  };
  
  const totals = calculateTotals();
  
  // Export to Excel (XLSX format)
  const exportExcelMutation = trpc.timeTracking.exportTimeReportExcel.useMutation();
  
  const handleExportExcel = async () => {
    if (!timeEntries || timeEntries.length === 0) {
      toast.error("Ingen data å eksportere");
      return;
    }
    
    try {
      toast.info("Genererer Excel-fil...");
      const result = await exportExcelMutation.mutateAsync({
        from,
        to,
        employeeId: selectedEmployee === "all" ? undefined : parseInt(selectedEmployee),
      });
      
      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      
      toast.success("Excel-rapport lastet ned!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Feil ved eksportering til Excel");
    }
  };
  
  // Export to PDF
  const exportPDFMutation = trpc.timeTracking.exportTimeReportPDF.useMutation();
  
  const handleExportPDF = async () => {
    if (!timeEntries || timeEntries.length === 0) {
      toast.error("Ingen data å eksportere");
      return;
    }
    
    try {
      toast.info("Genererer PDF-fil...");
      const result = await exportPDFMutation.mutateAsync({
        from,
        to,
        employeeId: selectedEmployee === "all" ? undefined : parseInt(selectedEmployee),
      });
      
      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      
      toast.success("PDF-rapport lastet ned!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Feil ved eksportering til PDF");
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            Tidsrapporter
          </h1>
          <p className="text-gray-600 mt-1">
            Oversikt over arbeidstimer og overtid
          </p>
        </div>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtrer rapport</CardTitle>
            <CardDescription>Velg periode og ansatt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Periode</label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">I dag</SelectItem>
                    <SelectItem value="week">Denne uken</SelectItem>
                    <SelectItem value="month">Denne måneden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ansatt</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle ansatte</SelectItem>
                    {staff?.map((member: any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Eksporter</label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Clock className="h-5 w-5" />
                Totale timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-900">{totals.totalHours}t</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="h-5 w-5" />
                Ordinære timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-900">{totals.regularHours}t</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Calendar className="h-5 w-5" />
                Overtidstimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-900">{totals.overtimeHours}t</p>
              <p className="text-sm text-amber-700 mt-1">Lørdag & Søndag</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Time Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tidsstemplinger</CardTitle>
            <CardDescription>
              {format(new Date(from), "dd. MMMM", { locale: nb })} - {format(new Date(to), "dd. MMMM yyyy", { locale: nb })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Laster...</p>
            ) : timeEntries && timeEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Ansatt</th>
                      <th className="text-left py-3 px-4 font-medium">Dato</th>
                      <th className="text-left py-3 px-4 font-medium">Inn</th>
                      <th className="text-left py-3 px-4 font-medium">Ut</th>
                      <th className="text-right py-3 px-4 font-medium">Timer</th>
                      <th className="text-center py-3 px-4 font-medium">Overtid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries.map((entry: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{entry.employeeName}</td>
                        <td className="py-3 px-4">
                          {format(new Date(entry.clockIn), "dd.MM.yyyy", { locale: nb })}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(entry.clockIn), "HH:mm")}
                        </td>
                        <td className="py-3 px-4">
                          {entry.clockOut ? format(new Date(entry.clockOut), "HH:mm") : (
                            <span className="text-amber-600 font-medium">Aktiv</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {entry.totalMinutes ? (entry.totalMinutes / 60).toFixed(1) + "t" : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {entry.isWeekend ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Ja
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Ingen tidsstemplinger funnet for valgt periode
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Sales Without Customer Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Salg uten kunde
            </CardTitle>
            <CardDescription>
              Oversikt over salg registrert uten kundetilknytning (walk-in kunder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesWithoutCustomer ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Totalt antall ordrer</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {salesWithoutCustomer.totalOrders}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Ordrer uten kunde</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {salesWithoutCustomer.ordersWithoutCustomer}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {salesWithoutCustomer.percentageWithoutCustomer.toFixed(1)}% av totalt
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Ordrer med kunde</p>
                    <p className="text-2xl font-bold text-green-600">
                      {salesWithoutCustomer.ordersWithCustomer}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {salesWithoutCustomer.percentageWithCustomer.toFixed(1)}% av totalt
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Omsetning</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total omsetning</p>
                      <p className="text-xl font-bold text-gray-900">
                        {salesWithoutCustomer.grandTotal.toFixed(2)} kr
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Omsetning uten kunde</p>
                      <p className="text-xl font-bold text-amber-600">
                        {salesWithoutCustomer.totalWithoutCustomer.toFixed(2)} kr
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {salesWithoutCustomer.percentageWithoutCustomer.toFixed(1)}% av total
                      </p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Omsetning med kunde</p>
                      <p className="text-xl font-bold text-teal-600">
                        {salesWithoutCustomer.totalWithCustomer.toFixed(2)} kr
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {salesWithoutCustomer.percentageWithCustomer.toFixed(1)}% av total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Laster data...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
