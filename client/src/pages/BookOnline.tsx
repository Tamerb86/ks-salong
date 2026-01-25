import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CalendarIcon, Clock, Loader2, MapPin, Phone, Scissors, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";

export default function BookOnline() {
  const [location] = useLocation();
  const isPublicBooking = location === "/book-online";
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"vipps" | "pay_later">("vipps");

  // Debug: Log selectedDate changes
  useEffect(() => {
    console.log("[BookOnline] selectedDate changed:", selectedDate);
  }, [selectedDate]);

  const { data: services, isLoading: servicesLoading } = trpc.services.list.useQuery();
  const { data: staff, isLoading: staffLoading } = trpc.staff.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: appointments } = trpc.appointments.listByDate.useQuery(
    { date: selectedDate || new Date() },
    { enabled: !!selectedDate }
  );

  const createBookingMutation = trpc.appointments.createWithPayment.useMutation({
    onSuccess: (data) => {
      if (data.requiresPayment && data.vippsUrl) {
        // Redirect to Vipps payment
        toast.info("Omdirigerer til Vipps...");
        window.location.href = data.vippsUrl;
      } else {
        // Booking confirmed without payment
        toast.success("Booking bekreftet! Vi gleder oss til å se deg!");
        setStep(6); // Success step
      }
    },
    onError: (error) => {
      toast.error("Feil ved booking: " + error.message);
    },
  });

  const activeServices = services?.filter((s: any) => s.isActive);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
    setStep(3);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Vennligst velg dato og tid");
      return;
    }
    setStep(4); // Customer info
  };

  const handleCustomerInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Vennligst fyll inn navn og telefon");
      return;
    }
    // Skip payment step if not required
    if (settings?.requirePaymentForBooking && settings?.vippsEnabled) {
      setStep(5); // Payment step
    } else {
      // Submit booking directly
      handleSubmitBooking(e);
    }
  };

  const handleSubmitBooking = (e: React.FormEvent, requirePayment: boolean = false) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Vennligst fyll inn navn og telefon");
      return;
    }

    const appointmentDate = selectedDate!;
    const [hours, minutes] = selectedTime.split(':');
    const endTime = new Date(appointmentDate);
    endTime.setHours(parseInt(hours), parseInt(minutes) + selectedService.duration);

    createBookingMutation.mutate({
      customerId: 1, // Will be created/linked in backend
      staffId: selectedStaff === "any" ? 1 : parseInt(selectedStaff),
      serviceId: selectedService.id,
      appointmentDate: appointmentDate,
      startTime: selectedTime,
      endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
      notes: `${customerInfo.name} - ${customerInfo.phone}${customerInfo.email ? ` - ${customerInfo.email}` : ''}${customerInfo.notes ? ` - ${customerInfo.notes}` : ''}`,
      requirePayment: requirePayment,
    });
  };

  const generateTimeSlots = () => {
    if (!selectedService || !staff) return [];

    // Get selected staff's duration multiplier
    let durationMultiplier = 1.0;
    if (selectedStaff !== "any") {
      const staffMember = staff.find((s: any) => s.id === parseInt(selectedStaff));
      if (staffMember && staffMember.durationMultiplier) {
        durationMultiplier = parseFloat(staffMember.durationMultiplier);
      }
    }

    // Calculate actual service duration based on staff skill
    const baseDuration = selectedService.duration; // in minutes
    const actualDuration = Math.ceil(baseDuration * durationMultiplier);

    // Generate time slots with appropriate intervals
    const slots = [];
    // Use staff-specific booking slot interval, fallback to 15 minutes
    const staffMember = staff?.find((s: any) => s.id === parseInt(selectedStaff));
    const slotInterval = staffMember?.bookingSlotInterval || 15;
    for (let hour = 9; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += slotInterval) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const isTimeSlotAvailable = (date: Date, time: string) => {
    if (!appointments || !selectedService || !staff) return true;

    // Get selected staff's duration multiplier
    let durationMultiplier = 1.0;
    if (selectedStaff !== "any") {
      const staffMember = staff.find((s: any) => s.id === parseInt(selectedStaff));
      if (staffMember && staffMember.durationMultiplier) {
        durationMultiplier = parseFloat(staffMember.durationMultiplier);
      }
    }

    // Calculate actual service duration
    const actualDuration = Math.ceil(selectedService.duration * durationMultiplier);

    const dateStr = format(date, "yyyy-MM-dd");
    const slotDateTime = new Date(`${dateStr}T${time}`);
    const slotEnd = new Date(slotDateTime.getTime() + actualDuration * 60000);

    return !appointments.some((apt: any) => {
      if (apt.status === "cancelled") return false;
      if (selectedStaff !== "any" && apt.staffId !== parseInt(selectedStaff)) return false;

      const aptStart = new Date(apt.appointmentTime);
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);

      return (
        (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
        (slotEnd > aptStart && slotEnd <= aptEnd) ||
        (slotDateTime <= aptStart && slotEnd >= aptEnd)
      );
    });
  };

  const loadingContent = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );

  if (servicesLoading || staffLoading) {
    return isPublicBooking ? loadingContent : <Layout>{loadingContent}</Layout>;
  }

  const bookingContent = (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-purple-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Scissors className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">K.S Salong</h1>
              <p className="text-purple-100">Luksus OG Rimelige PRISER!</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Storgata 122C, 3915 Porsgrunn</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+47 929 81 628</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">🏆 Norgesmester 2022</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-gradient-to-r from-purple-600 to-amber-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? "bg-gradient-to-r from-purple-600 to-amber-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Velg tjeneste</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {activeServices?.map((service: any) => (
                <Card
                  key={service.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-300"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription>{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {service.price} kr
                        </span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                        Velg denne
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && selectedService && (
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="mb-6"
            >
              ← Tilbake
            </Button>
            <h2 className="text-3xl font-bold text-center mb-8">Velg frisør</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff?.filter((s: any) => s.role === "barber" && s.isActive).map((member: any) => (
                <Card
                  key={member.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-300"
                  onClick={() => handleStaffSelect(member.id.toString())}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle>{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-amber-600">
                      Velg {member.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              className="mb-6"
            >
              ← Tilbake
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Velg dato og tid</CardTitle>
                <CardDescription>
                  {selectedService.name} - {selectedService.duration} min - {selectedService.price} kr
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Dato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: nb })
                        ) : (
                          <span>Velg dato</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          console.log("[BookOnline] Calendar onSelect:", date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Tilgjengelige tider</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {generateTimeSlots().map((time) => {
                        const available = isTimeSlotAvailable(selectedDate, time);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={`${
                              selectedTime === time
                                ? "bg-gradient-to-r from-purple-600 to-amber-600"
                                : ""
                            } ${!available ? "opacity-30 cursor-not-allowed" : ""}`}
                            onClick={() => available && setSelectedTime(time)}
                            disabled={!available}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-gradient-to-r from-purple-600 to-amber-600"
                >
                  Fortsett til kontaktinfo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Customer Info */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setStep(3)}
              className="mb-6"
            >
              ← Tilbake
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Dine kontaktopplysninger</CardTitle>
                <CardDescription>
                  Vi trenger disse for å bekrefte bookingen din
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomerInfoNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Navn *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      placeholder="Ditt fulle navn"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      placeholder="+47 XXX XX XXX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, email: e.target.value })
                      }
                      placeholder="din@epost.no"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notater (valgfritt)</Label>
                    <Input
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, notes: e.target.value })
                      }
                      placeholder="Spesielle ønsker eller merknader"
                    />
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                    <h3 className="font-semibold">Oppsummering:</h3>
                    <p><strong>Tjeneste:</strong> {selectedService.name}</p>
                    <p><strong>Dato:</strong> {selectedDate ? format(selectedDate, "PPP", { locale: nb }) : ""}</p>
                    <p><strong>Tid:</strong> {selectedTime}</p>
                    <p><strong>Pris:</strong> {selectedService.price} kr</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                  >
                    Neste: Betaling
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-6 w-6 text-purple-600" />
                  Betaling
                </CardTitle>
                <CardDescription>
                  Velg betalingsmetode for å bekrefte bookingen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Summary */}
                <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">Oppsummering:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Tjeneste:</strong> {selectedService.name}</p>
                    <p><strong>Varighet:</strong> {selectedService.duration} minutter</p>
                    <p><strong>Dato:</strong> {selectedDate ? format(selectedDate, "PPP", { locale: nb }) : ""}</p>
                    <p><strong>Tid:</strong> {selectedTime}</p>
                    <p><strong>Kunde:</strong> {customerInfo.name}</p>
                    <p><strong>Telefon:</strong> {customerInfo.phone}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-purple-200">
                    <p className="text-2xl font-bold text-purple-900">
                      Total: {selectedService.price} kr
                    </p>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <Label className="text-base">Velg betalingsmetode:</Label>
                  
                  {/* Vipps Payment */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "vipps"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => setPaymentMethod("vipps")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Betal med Vipps</p>
                        <p className="text-sm text-gray-600">Rask og sikker betaling</p>
                      </div>
                      {paymentMethod === "vipps" && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pay Later Option (if not required) */}
                  {!settings?.requirePaymentForBooking && (
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "pay_later"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => setPaymentMethod("pay_later")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Betal senere</p>
                          <p className="text-sm text-gray-600">Betal når du kommer til salonen</p>
                        </div>
                        {paymentMethod === "pay_later" && (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1"
                  >
                    Tilbake
                  </Button>
                  <Button
                    onClick={(e) => {
                      const requirePayment = paymentMethod === "vipps";
                      handleSubmitBooking(e, requirePayment);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {paymentMethod === "vipps" ? "Betal med Vipps" : "Bekreft booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Message */}
        {step === 6 && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Booking bekreftet!</h2>
              <p className="text-gray-600 mb-6">
                Vi har sendt en bekreftelse til {customerInfo.phone}
              </p>
              <div className="p-6 bg-purple-50 rounded-lg mb-6">
                <p className="font-semibold mb-2">Din avtale:</p>
                <p>{selectedService.name}</p>
                <p>{selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: nb }) : ""} kl. {selectedTime}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Storgata 122C, 3915 Porsgrunn
                </p>
              </div>
              <Button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedStaff("any");
                  setSelectedDate(undefined);
                  setSelectedTime("");
                  setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
                }}
                variant="outline"
              >
                Book en ny time
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  return isPublicBooking ? bookingContent : <Layout>{bookingContent}</Layout>;
}
