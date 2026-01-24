import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO, isSameDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, User, X, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch appointments for the current week
  const { data: appointments = [], refetch } = trpc.appointments.listByDate.useQuery(
    {
      date: weekStart,
    },
    { enabled: !authLoading }
  );

  // Fetch services and staff for the form
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
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke oppdatere avtale");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "checked_in":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "completed":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "no_show":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
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

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt: any) => isSameDay(parseISO(apt.appointmentDate), date));
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Avtaler</h1>
            <p className="text-gray-600 mt-1">Administrer timebestillinger</p>
          </div>
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Ny avtale
              </Button>
            </DialogTrigger>
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

        {/* Week Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-lg">
                  Uke {format(weekStart, "w, yyyy")}
                </span>
                <span className="text-gray-600">
                  ({format(weekStart, "d MMM")} - {format(addDays(weekStart, 6), "d MMM")})
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentWeek(new Date())}
                >
                  I dag
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <Card
                key={day.toISOString()}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isToday ? "ring-2 ring-purple-600" : ""
                } ${isSelected ? "bg-purple-50" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {format(day, "EEE")}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {format(day, "d")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {dayAppointments.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {dayAppointments.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Ingen avtaler
                        </p>
                      ) : (
                        dayAppointments.map((apt: any) => (
                          <div
                            key={apt.id}
                            className={`p-3 rounded-lg border ${getStatusColor(apt.status)} cursor-pointer hover:shadow-md transition-shadow`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {apt.customerName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {apt.serviceName}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">
                                    {apt.startTime} - {apt.endTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  <span className="text-xs">{apt.staffName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Appointment Details Dialog */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedAppointment && (
              <>
                <DialogHeader>
                  <DialogTitle>Avtaledetaljer</DialogTitle>
                  <DialogDescription>
                    {format(parseISO(selectedAppointment.appointmentDate), "EEEE, d MMMM yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusLabel(selectedAppointment.status)}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Kunde:</strong> {selectedAppointment.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Tjeneste:</strong> {selectedAppointment.serviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Tid:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Ansatt:</strong> {selectedAppointment.staffName}
                      </span>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-sm">
                          <strong>Notater:</strong> {selectedAppointment.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  {selectedAppointment.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedAppointment.id,
                          status: "confirmed",
                        });
                        setSelectedAppointment(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Bekreft
                    </Button>
                  )}
                  {selectedAppointment.status === "confirmed" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedAppointment.id,
                          status: "checked_in",
                        });
                        setSelectedAppointment(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Sjekk inn
                    </Button>
                  )}
                  {selectedAppointment.status === "checked_in" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedAppointment.id,
                          status: "completed",
                        });
                        setSelectedAppointment(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Fullfør
                    </Button>
                  )}
                  {!["cancelled", "completed", "no_show"].includes(selectedAppointment.status) && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Er du sikker på at du vil kansellere denne avtalen?")) {
                          updateMutation.mutate({
                            id: selectedAppointment.id,
                            status: "cancelled",
                            cancellationReason: "Kansellert av bruker",
                          });
                          setSelectedAppointment(null);
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Kanseller
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
