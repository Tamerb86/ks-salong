import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO 
} from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, User, X, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch appointments for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { data: appointments = [], refetch, isLoading: appointmentsLoading } = trpc.appointments.listByDateRange.useQuery(
    {
      startDate: format(monthStart, "yyyy-MM-dd"),
      endDate: format(monthEnd, "yyyy-MM-dd"),
    },
    { 
      enabled: !authLoading,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  );

  // Fetch services, staff, and customers for forms
  const { data: services = [] } = trpc.services.list.useQuery(undefined, { enabled: !authLoading });
  const { data: staff = [] } = trpc.staff.list.useQuery(undefined, { enabled: !authLoading });
  const { data: customers = [] } = trpc.customers.list.useQuery(undefined, { enabled: !authLoading });

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Avtale opprettet");
      setIsNewAppointmentOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunne ikke opprette avtale");
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Avtale oppdatert");
      setIsDetailsOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke oppdatere avtale");
    },
  });

  // Generate calendar grid
  const generateCalendarDays = () => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = [];
    let day = start;

    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt: any) => {
      const aptDate = typeof apt.appointmentDate === 'string' 
        ? parseISO(apt.appointmentDate) 
        : new Date(apt.appointmentDate);
      return isSameDay(aptDate, date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 text-white";
      case "checked_in":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-purple-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "no_show":
        return "bg-orange-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Venter",
      confirmed: "Bekreftet",
      checked_in: "Innsjekket",
      completed: "Fullført",
      cancelled: "Kansellert",
      no_show: "Møtte ikke",
    };
    return labels[status] || status;
  };

  const handleCreateAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      customerId: parseInt(formData.get("customerId") as string),
      staffId: parseInt(formData.get("staffId") as string),
      serviceId: parseInt(formData.get("serviceId") as string),
      appointmentDate: format(selectedDate, "yyyy-MM-dd") as any,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedAppointment) return;
    
    updateMutation.mutate({
      id: selectedAppointment.id,
      status: newStatus as any,
    });
  };

  const generateGoogleCalendarLink = (appointment: any) => {
    const startDateTime = `${appointment.appointmentDate}T${appointment.startTime}:00`;
    const endDateTime = `${appointment.appointmentDate}T${appointment.endTime}:00`;
    
    const title = encodeURIComponent(`${appointment.service?.name || 'Avtale'} - ${appointment.customer?.firstName} ${appointment.customer?.lastName}`);
    const details = encodeURIComponent(`Kunde: ${appointment.customer?.firstName} ${appointment.customer?.lastName}\nTelefon: ${appointment.customer?.phone}\nAnsatt: ${appointment.staff?.name}\n\nNotater: ${appointment.notes || 'Ingen'}`);
    const dates = `${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
              <p className="text-gray-600 mt-1">Månedlig kalendervisning</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedDate(new Date());
                setIsNewAppointmentOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny avtale
            </Button>
          </div>

          {/* Month Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-xl">
                    {format(currentMonth, "MMMM yyyy", { locale: nb })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    I dag
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Weekday Headers */}
                {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, idx) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[120px] border rounded-lg p-2 transition-all ${
                        isCurrentMonth
                          ? "bg-white hover:bg-gray-50"
                          : "bg-gray-50 text-gray-400"
                      } ${isTodayDate ? "ring-2 ring-purple-500" : ""}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isTodayDate ? "text-purple-600 font-bold" : ""}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((apt: any) => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsDetailsOpen(true);
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(apt.status)}`}
                          >
                            <div className="font-medium truncate">
                              {apt.startTime} - {apt.customer?.firstName}
                            </div>
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayAppointments.length - 3} mer
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge className="bg-yellow-500">Venter</Badge>
                <Badge className="bg-blue-500">Bekreftet</Badge>
                <Badge className="bg-green-500">Innsjekket</Badge>
                <Badge className="bg-purple-500">Fullført</Badge>
                <Badge className="bg-red-500">Kansellert</Badge>
                <Badge className="bg-orange-500">Møtte ikke</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Avtaledetaljer
              </DialogTitle>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {getStatusLabel(selectedAppointment.status)}
                  </Badge>
                  <a
                    href={generateGoogleCalendarLink(selectedAppointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Legg til i Google Calendar
                  </a>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Kundeinformasjon
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Navn:</span> {selectedAppointment.customer?.firstName} {selectedAppointment.customer?.lastName}</p>
                    <p><span className="font-medium">Telefon:</span> {selectedAppointment.customer?.phone}</p>
                    <p><span className="font-medium">E-post:</span> {selectedAppointment.customer?.email}</p>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avtaleinformasjon
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Dato:</span> {format(
                      typeof selectedAppointment.appointmentDate === 'string' 
                        ? parseISO(selectedAppointment.appointmentDate) 
                        : new Date(selectedAppointment.appointmentDate), 
                      "d. MMMM yyyy", 
                      { locale: nb }
                    )}</p>
                    <p><span className="font-medium">Tid:</span> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                    <p><span className="font-medium">Tjeneste:</span> {selectedAppointment.service?.name}</p>
                    <p><span className="font-medium">Pris:</span> {selectedAppointment.service?.price} kr</p>
                    <p><span className="font-medium">Ansatt:</span> {selectedAppointment.staff?.name}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Notater</h3>
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Status Update Buttons */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Endre status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("confirmed")}
                      disabled={selectedAppointment.status === "confirmed"}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Bekreft
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("checked_in")}
                      disabled={selectedAppointment.status === "checked_in"}
                      className="border-green-300 text-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Sjekk inn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("completed")}
                      disabled={selectedAppointment.status === "completed"}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Fullfør
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate("cancelled")}
                      disabled={selectedAppointment.status === "cancelled"}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Kanseller
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Lukk
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Appointment Dialog */}
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateAppointment}>
              <DialogHeader>
                <DialogTitle>Opprett ny avtale</DialogTitle>
                <DialogDescription>
                  Fyll inn detaljer for den nye avtalen
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerId">Kunde</Label>
                  <Select name="customerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kunde" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serviceId">Tjeneste</Label>
                  <Select name="serviceId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg tjeneste" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} - {service.duration} min - {service.price} kr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staffId">Ansatt</Label>
                  <Select name="staffId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg ansatt" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.role === 'barber' || s.role === 'manager' || s.role === 'owner').map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointmentDate">Dato</Label>
                  <Input 
                    type="date" 
                    name="appointmentDate"
                    defaultValue={format(selectedDate, "yyyy-MM-dd")}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Starttid</Label>
                    <Input type="time" name="startTime" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Sluttid</Label>
                    <Input type="time" name="endTime" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notater (valgfritt)</Label>
                  <Textarea name="notes" placeholder="Spesielle ønsker eller notater..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
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
