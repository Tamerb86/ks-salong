import { format, isSameDay, parseISO, addMinutes, parse } from "date-fns";
import { nb } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MapPin } from "lucide-react";

interface Appointment {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
  service?: {
    name: string;
    duration: number;
  };
  staff?: {
    name: string;
  };
  notes?: string;
}

interface DailyCalendarProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (time: string) => void;
}

const WORKING_START = 9; // 9:00 AM
const WORKING_END = 18; // 6:00 PM
const SLOT_INTERVAL = 15; // minutes

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-50 border-green-300 hover:bg-green-100";
    case "pending":
      return "bg-yellow-50 border-yellow-300 hover:bg-yellow-100";
    case "completed":
      return "bg-blue-50 border-blue-300 hover:bg-blue-100";
    case "cancelled":
      return "bg-red-50 border-red-300 hover:bg-red-100";
    case "checked-in":
      return "bg-purple-50 border-purple-300 hover:bg-purple-100";
    case "no-show":
      return "bg-gray-50 border-gray-300 hover:bg-gray-100";
    default:
      return "bg-gray-50 border-gray-300 hover:bg-gray-100";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Bekreftet";
    case "pending":
      return "Venter";
    case "completed":
      return "Fullført";
    case "cancelled":
      return "Kansellert";
    case "checked-in":
      return "Innsjekket";
    case "no-show":
      return "Ikke møtt";
    default:
      return status;
  }
};

export function DailyCalendar({ selectedDate, appointments, onAppointmentClick, onTimeSlotClick }: DailyCalendarProps) {
  // Generate all time slots for the day (every 15 minutes)
  const timeSlots: string[] = [];
  for (let hour = WORKING_START; hour < WORKING_END; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeSlots.push(timeStr);
    }
  }

  // Get appointments for a specific time slot
  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find((apt) => {
      const aptDate = typeof apt.appointmentDate === 'string' 
        ? parseISO(apt.appointmentDate) 
        : new Date(apt.appointmentDate);
      
      if (!isSameDay(aptDate, selectedDate)) return false;
      
      // Check if this time slot is within the appointment's time range
      const slotTime = parse(timeSlot, 'HH:mm', new Date());
      const startTime = parse(apt.startTime, 'HH:mm', new Date());
      const endTime = parse(apt.endTime, 'HH:mm', new Date());
      
      return slotTime >= startTime && slotTime < endTime;
    });
  };

  // Calculate how many slots an appointment spans
  const getAppointmentSlotSpan = (apt: Appointment) => {
    const startTime = parse(apt.startTime, 'HH:mm', new Date());
    const endTime = parse(apt.endTime, 'HH:mm', new Date());
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    return Math.ceil(durationMinutes / SLOT_INTERVAL);
  };

  // Track which slots are already rendered (to avoid duplicates)
  const renderedSlots = new Set<string>();

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800">
          {format(selectedDate, "EEEE", { locale: nb })}
        </h3>
        <p className="text-lg text-gray-600">
          {format(selectedDate, "d. MMMM yyyy", { locale: nb })}
        </p>
      </div>

      {/* Time Slots */}
      <div className="space-y-1">
        {timeSlots.map((timeSlot) => {
          const appointment = getAppointmentForTimeSlot(timeSlot);
          const slotKey = `${timeSlot}-${appointment?.id || 'empty'}`;
          
          // If this slot is part of an already-rendered appointment, skip it
          if (renderedSlots.has(slotKey) && appointment) {
            return null;
          }

          // If there's an appointment starting at this slot, mark all its slots as rendered
          if (appointment && appointment.startTime === timeSlot) {
            const spanCount = getAppointmentSlotSpan(appointment);
            for (let i = 0; i < spanCount; i++) {
              const slotIndex = timeSlots.indexOf(timeSlot) + i;
              if (slotIndex < timeSlots.length) {
                renderedSlots.add(`${timeSlots[slotIndex]}-${appointment.id}`);
              }
            }
          }

          return (
            <div key={timeSlot} className="grid grid-cols-[100px_1fr] gap-4 items-start">
              {/* Time Label */}
              <div className="text-sm font-medium text-gray-600 pt-2 text-right">
                {timeSlot}
              </div>

              {/* Appointment or Empty Slot */}
              <div className="min-h-[60px]">
                {appointment && appointment.startTime === timeSlot ? (
                  <Card
                    className={`p-4 cursor-pointer transition-all border-l-4 ${getStatusColor(appointment.status)}`}
                    onClick={() => onAppointmentClick(appointment)}
                    style={{ minHeight: `${getAppointmentSlotSpan(appointment) * 60}px` }}
                  >
                    <div className="space-y-2">
                      {/* Time and Duration */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-sm">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {appointment.service?.duration || 0} min
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      {/* Customer Name */}
                      <div className="text-lg font-bold text-gray-800">
                        {appointment.customer 
                          ? `${appointment.customer.firstName} ${appointment.customer.lastName}` 
                          : 'Ukjent kunde'}
                      </div>

                      {/* Service */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.service ? appointment.service.name : 'Ukjent tjeneste'}</span>
                      </div>

                      {/* Staff */}
                      {appointment.staff && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{appointment.staff.name}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 italic mt-2 pt-2 border-t">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </Card>
                ) : !appointment ? (
                  <div
                    className="h-[60px] border border-dashed border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center text-gray-400 text-sm"
                    onClick={() => onTimeSlotClick?.(timeSlot)}
                  >
                    Ledig
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
