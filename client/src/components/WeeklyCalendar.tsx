import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

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
  };
  staff?: {
    name: string;
  };
}

interface WeeklyCalendarProps {
  currentWeek: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const WORKING_HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9:00 - 18:00

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "checked-in":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "no-show":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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

export function WeeklyCalendar({ currentWeek, appointments, onAppointmentClick }: WeeklyCalendarProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = typeof apt.appointmentDate === 'string' 
        ? parseISO(apt.appointmentDate) 
        : new Date(apt.appointmentDate);
      const aptHour = parseInt(apt.startTime.split(":")[0]);
      return isSameDay(aptDate, day) && aptHour === hour;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] lg:min-w-[1000px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-1 md:gap-2 mb-2">
          <div className="text-xs md:text-sm font-medium text-gray-500 p-1 md:p-2">Tid</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-xs md:text-sm font-semibold">
                <span className="hidden sm:inline">{format(day, "EEEE", { locale: nb })}</span>
                <span className="sm:hidden">{format(day, "EEE", { locale: nb })}</span>
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">
                {format(day, "d MMM", { locale: nb })}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="space-y-1">
          {WORKING_HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1 md:gap-2">
              {/* Time label */}
              <div className="text-xs md:text-sm text-gray-600 p-1 md:p-2 flex items-start">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Day cells */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[60px] md:min-h-[80px] border border-gray-200 rounded-md p-0.5 md:p-1 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {dayAppointments.map((apt) => (
                      <Card
                        key={apt.id}
                        className={`p-1 md:p-2 cursor-pointer hover:shadow-md transition-shadow border-l-2 md:border-l-4 ${getStatusColor(
                          apt.status
                        )}`}
                        onClick={() => onAppointmentClick(apt)}
                      >
                        <div className="space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs">
                            <Clock className="h-2 w-2 md:h-3 md:w-3" />
                            <span className="font-medium">
                              {apt.startTime} - {apt.endTime}
                            </span>
                          </div>
                          <div className="font-semibold text-xs md:text-sm truncate">
                            {apt.customer ? `${apt.customer.firstName} ${apt.customer.lastName}` : 'Ukjent kunde'}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-600 truncate hidden sm:block">
                            {apt.service ? apt.service.name : 'Ukjent tjeneste'}
                          </div>
                          {apt.staff && (
                            <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500 hidden md:flex">
                              <User className="h-2 w-2 md:h-3 md:w-3" />
                              <span className="truncate">{apt.staff.name}</span>
                            </div>
                          )}
                          <Badge variant="outline" className="text-[9px] md:text-xs hidden sm:inline-flex">
                            {getStatusLabel(apt.status)}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
