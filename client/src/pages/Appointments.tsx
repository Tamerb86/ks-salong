import { Layout } from "@/components/Layout";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { DailyCalendar } from "@/components/DailyCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Pencil, Trash2, Calendar, Clock, User, Phone, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Appointments() {
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [addFormData, setAddFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceId: "",
    staffId: "0",
    appointmentDate: "",
    appointmentTime: "",
    paymentMethod: "cash",
    notes: ""
  });

  // Fetch data
  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();
  const { data: staff } = trpc.staff.list.useQuery();
  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Avtale oppdatert!");
      refetch();
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Kunne ikke oppdatere avtale");
    },
  });
  const cancelMutation = trpc.appointments.cancelByToken.useMutation({
    onSuccess: () => {
      toast.success("Avtale kansellert!");
      refetch();
      setCancelDialogOpen(false);
    },
    onError: () => {
      toast.error("Kunne ikke kansellere avtale");
    },
  });
  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Avtale opprettet!");
      refetch();
      setAddDialogOpen(false);
      setAddFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        serviceId: "",
        staffId: "0",
        appointmentDate: "",
        appointmentTime: "",
        paymentMethod: "cash",
        notes: ""
      });
    },
    onError: (error) => {
      toast.error("Kunne ikke opprette avtale: " + error.message);
    },
  });

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    const date = new Date(appointment.appointmentDate);
    setEditDate(format(date, "yyyy-MM-dd"));
    setEditTime(appointment.appointmentTime);
    setEditDialogOpen(true);
  };

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;
    updateMutation.mutate({
      id: selectedAppointment.id,
      appointmentDate: editDate,
      startTime: editTime,
    });
  };

  const handleConfirmCancel = () => {
    if (!selectedAppointment) return;
    cancelMutation.mutate({ id: selectedAppointment.id });
  };  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleTimeSlotClick = (time: string) => {
    // Open add appointment dialog with pre-filled time
    setAddFormData(prev => ({
      ...prev,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      appointmentTime: time
    }));
    setAddDialogOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditDate(appointment.appointmentDate);
    setEditTime(appointment.startTime);
    setEditDialogOpen(true);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.customerName || !addFormData.customerPhone || !addFormData.serviceId || !addFormData.appointmentDate || !addFormData.appointmentTime) {
      toast.error("Vennligst fyll ut alle obligatoriske felt");
      return;
    }
    createMutation.mutate({
      ...addFormData,
      serviceId: parseInt(addFormData.serviceId),
      staffId: addFormData.staffId && addFormData.staffId !== "0" ? parseInt(addFormData.staffId) : undefined,
    })
  };


  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <p>Please log in to view appointments.</p>
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Avtaler
                </h1>
                <LiveBadge text="Live" />
              </div>
              <p className="text-gray-600 mt-1">Administrer avtaler med kalender- eller listevisning</p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Legg til avtale
            </Button>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Kalendervisning
              </TabsTrigger>
              <TabsTrigger value="list">Listevisning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-6">
              {/* View toggle and navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={calendarView === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("monthly")}
                  >
                    Månedsvisning
                  </Button>
                  <Button
                    variant={calendarView === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("weekly")}
                  >
                    Ukesvisning
                  </Button>
                  <Button
                    variant={calendarView === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("daily")}
                  >
                    Dagsvisning
                  </Button>
                </div>
                {calendarView === "weekly" && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                      <ChevronLeft className="h-4 w-4" />
                      Forrige uke
                    </Button>
                    <span className="text-sm font-medium px-4">
                      {format(currentWeek, "d MMM yyyy", { locale: nb })}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextWeek}>
                      Neste uke
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {calendarView === "daily" && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                      <ChevronLeft className="h-4 w-4" />
                      Forrige dag
                    </Button>
                    <span className="text-sm font-medium px-4">
                      {format(selectedDate, "d MMMM yyyy", { locale: nb })}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextDay}>
                      Neste dag
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Calendar views */}
              {calendarView === "monthly" ? (
                <MonthlyCalendar />
              ) : calendarView === "weekly" ? (
                <WeeklyCalendar
                  currentWeek={currentWeek}
                  appointments={appointments || []}
                  onAppointmentClick={handleAppointmentClick}
                />
              ) : (
                <DailyCalendar
                  selectedDate={selectedDate}
                  appointments={appointments || []}
                  onAppointmentClick={handleAppointmentClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
            </TabsContent>
            
            <TabsContent value="list" className="mt-6">
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : appointments && appointments.length > 0 ? (
                <div className="rounded-lg border bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dato & Tid</TableHead>
                        <TableHead>Kunde</TableHead>
                        <TableHead>Tjeneste</TableHead>
                        <TableHead>Ansatt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt: any) => (
                        <TableRow key={apt.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">
                                  {format(new Date(apt.appointmentDate), "d. MMMM yyyy", { locale: nb })}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {apt.appointmentTime}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{apt.customerName}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {apt.customerPhone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{apt.serviceName}</div>
                              <div className="text-sm text-gray-500">{apt.duration} min</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              {apt.staffName || "Første ledige"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                apt.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : apt.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {apt.status === "confirmed" ? "Bekreftet" : apt.status === "cancelled" ? "Kansellert" : "Venter"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(apt)}
                                disabled={apt.status === "cancelled"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelClick(apt)}
                                disabled={apt.status === "cancelled"}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Ingen avtaler funnet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Appointment Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddAppointment}>
              <DialogHeader>
                <DialogTitle>Legg til ny avtale</DialogTitle>
                <DialogDescription>
                  Fyll ut informasjonen nedenfor for å opprette en ny avtale
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Customer Information */}
                <div className="space-y-2">
                  <Label htmlFor="customerName">Kundenavn *</Label>
                  <Input
                    id="customerName"
                    value={addFormData.customerName}
                    onChange={(e) => setAddFormData({ ...addFormData, customerName: e.target.value })}
                    placeholder="Fullt navn"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefon *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={addFormData.customerPhone}
                    onChange={(e) => setAddFormData({ ...addFormData, customerPhone: e.target.value })}
                    placeholder="+47 xxx xx xxx"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">E-post</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={addFormData.customerEmail}
                    onChange={(e) => setAddFormData({ ...addFormData, customerEmail: e.target.value })}
                    placeholder="epost@eksempel.no"
                  />
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">Tjeneste *</Label>
                  <Select
                    value={addFormData.serviceId}
                    onValueChange={(value) => setAddFormData({ ...addFormData, serviceId: value })}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Velg tjeneste" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service: any) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} ({service.duration} min - {service.price} kr)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Staff Selection */}
                <div className="space-y-2">
                  <Label htmlFor="staff">Ansatt</Label>
                  <Select
                    value={addFormData.staffId}
                    onValueChange={(value) => setAddFormData({ ...addFormData, staffId: value })}
                  >
                    <SelectTrigger id="staff">
                      <SelectValue placeholder="Første ledige" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Første ledige</SelectItem>
                      {staff?.filter((s: any) => s.role === 'barber' && s.isActive).map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Dato *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={addFormData.appointmentDate}
                      onChange={(e) => setAddFormData({ ...addFormData, appointmentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Tid *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={addFormData.appointmentTime}
                      onChange={(e) => setAddFormData({ ...addFormData, appointmentTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Betalingsmetode *</Label>
                  <Select
                    value={addFormData.paymentMethod}
                    onValueChange={(value) => setAddFormData({ ...addFormData, paymentMethod: value })}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Kontant</SelectItem>
                      <SelectItem value="card">Kort</SelectItem>
                      <SelectItem value="vipps">Vipps</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="later">Betal senere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notater</Label>
                  <Textarea
                    id="notes"
                    value={addFormData.notes}
                    onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                    placeholder="Eventuelle notater..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Oppretter..." : "Opprett avtale"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
