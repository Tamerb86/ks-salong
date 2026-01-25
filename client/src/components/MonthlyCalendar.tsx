import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Appointment {
  id: number;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  staffId: number | null;
  staffName: string | null;
  serviceId: number | null;
  serviceName: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
}

interface AppointmentCardProps {
  appointment: Appointment;
  isDragging?: boolean;
}

function AppointmentCard({ appointment, isDragging }: AppointmentCardProps) {
  const statusColors = {
    pending: "bg-yellow-100 border-yellow-300",
    confirmed: "bg-blue-100 border-blue-300",
    completed: "bg-green-100 border-green-300",
    cancelled: "bg-red-100 border-red-300",
    no_show: "bg-gray-100 border-gray-300",
  };

  return (
    <div
      className={`p-2 rounded border text-xs mb-1 cursor-move ${
        statusColors[appointment.status as keyof typeof statusColors] || "bg-gray-100"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="font-semibold truncate">{appointment.customerName || "Walk-in"}</div>
      <div className="text-gray-600 truncate">{appointment.serviceName}</div>
      <div className="text-gray-500">
        {appointment.startTime} - {appointment.endTime}
      </div>
      {appointment.staffName && (
        <div className="text-gray-500 truncate">👤 {appointment.staffName}</div>
      )}
    </div>
  );
}

function DraggableAppointment({ appointment }: { appointment: Appointment }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: appointment.id.toString(),
    data: appointment,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppointmentCard appointment={appointment} isDragging={isDragging} />
    </div>
  );
}

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Fetch appointments for the current month
  const { data: appointments = [], refetch } = trpc.appointments.listByDateRange.useQuery({
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
  });

  const updateAppointmentMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Avtale flyttet!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke flytte avtalen");
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Add padding days for the start of the month
    const startDayOfWeek = start.getDay();
    const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Monday = 0

    const paddedDays = Array(paddingDays).fill(null).concat(days);

    return paddedDays;
  }, [currentDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt: any) => {
      const dateKey = format(parseISO(apt.appointmentDate), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt as Appointment);
    });
    return grouped;
  }, [appointments]);

  const handleDragStart = (event: DragStartEvent) => {
    const appointment = appointments.find((apt: any) => apt.id.toString() === event.active.id);
    setActiveAppointment(appointment as unknown as Appointment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAppointment(null);

    if (!over || active.id === over.id) return;

    const appointmentId = parseInt(active.id.toString());
    const newDate = over.id.toString();

    // Find the appointment to get its current time
    const appointment = appointments.find((apt: any) => apt.id === appointmentId);
    if (!appointment) return;

    // Update appointment date while keeping the same time
    updateAppointmentMutation.mutate({
      id: appointmentId,
      appointmentDate: newDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Månedskalender
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              I dag
            </Button>
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: nb })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm py-2 bg-gray-100 rounded"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 rounded" />;
              }

              const dateKey = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={dateKey}
                  id={dateKey}
                  className={`min-h-[120px] border rounded p-2 ${
                    isToday ? "bg-purple-50 border-purple-300" : "bg-white"
                  } ${!isCurrentMonth ? "opacity-50" : ""}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? "text-purple-600" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[90px]">
                    {dayAppointments.map((appointment) => (
                      <DraggableAppointment key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeAppointment && <AppointmentCard appointment={activeAppointment} />}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
