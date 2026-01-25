import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { addWeeks, addMonths } from "date-fns";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus, Repeat, Info } from "lucide-react";
import { format } from "date-fns";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"weekly" | "monthly">("weekly");
  const [recurrenceCount, setRecurrenceCount] = useState(4);
  const [quickCustomer, setQuickCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const { data: customers, refetch: refetchCustomers } = trpc.customers.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();
  const { data: staff } = trpc.staff.list.useQuery();

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Kunde opprettet!");
      if (data?.id) {
        setCustomerId(data.id.toString());
      }
      setShowQuickCustomer(false);
      setQuickCustomer({ firstName: "", lastName: "", phone: "", email: "" });
      refetchCustomers();
    },
    onError: (error) => {
      toast.error("Feil ved oppretting av kunde: " + error.message);
    },
  });

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Avtale opprettet!");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Feil ved oppretting: " + error.message);
    },
  });

  const resetForm = () => {
    setCustomerId("");
    setServiceId("");
    setStaffId("");
    setAppointmentDate("");
    setStartTime("");
    setNotes("");
    setIsRecurring(false);
    setRecurrencePattern("weekly");
    setRecurrenceCount(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !serviceId || !staffId || !appointmentDate || !startTime) {
      toast.error("Vennligst fyll ut alle obligatoriske felt");
      return;
    }

    // Calculate end time based on service duration
    const selectedService = services?.find((s: any) => s.id === parseInt(serviceId));
    if (!selectedService) {
      toast.error("Tjeneste ikke funnet");
      return;
    }

    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + selectedService.duration, 0, 0);
    const endTime = format(endDate, "HH:mm");

    // Handle recurring appointments
    if (isRecurring) {
      const baseDate = new Date(appointmentDate);
      const appointments: Array<{
        customerId: number;
        serviceId: number;
        staffId: number;
        appointmentDate: Date;
        startTime: string;
        endTime: string;
        notes?: string;
      }> = [];
      
      for (let i = 0; i < recurrenceCount; i++) {
        const currentDate = recurrencePattern === "weekly" 
          ? addWeeks(baseDate, i)
          : addMonths(baseDate, i);
        
        appointments.push({
          customerId: parseInt(customerId),
          serviceId: parseInt(serviceId),
          staffId: parseInt(staffId),
          appointmentDate: currentDate,
          startTime,
          endTime,
          notes: notes || undefined,
        });
      }

      // Create appointments sequentially
      let successCount = 0;
      const createNext = (index: number) => {
        if (index >= appointments.length) {
          toast.success(`${successCount} avtaler opprettet!`);
          onOpenChange(false);
          resetForm();
          onSuccess?.();
          return;
        }

        createMutation.mutate(appointments[index], {
          onSuccess: () => {
            successCount++;
            createNext(index + 1);
          },
          onError: (error) => {
            toast.error(`Feil ved avtale ${index + 1}: ${error.message}`);
            if (successCount > 0) {
              toast.info(`${successCount} avtaler ble opprettet før feilen`);
              onSuccess?.();
            }
          },
        });
      };

      createNext(0);
    } else {
      // Single appointment
      createMutation.mutate({
        customerId: parseInt(customerId),
        serviceId: parseInt(serviceId),
        staffId: parseInt(staffId),
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        notes: notes || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            Opprett Ny Avtale
          </DialogTitle>
          <DialogDescription>
            Fyll ut informasjonen nedenfor for å opprette en ny avtale
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="customer">Kunde *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickCustomer(!showQuickCustomer)}
                className="text-purple-600 hover:text-purple-700"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {showQuickCustomer ? "Velg eksisterende" : "Ny kunde"}
              </Button>
            </div>

            {showQuickCustomer ? (
              <div className="space-y-3 p-4 border rounded-lg bg-purple-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quick-firstName" className="text-sm">Fornavn *</Label>
                    <Input
                      id="quick-firstName"
                      value={quickCustomer.firstName}
                      onChange={(e) => setQuickCustomer({ ...quickCustomer, firstName: e.target.value })}
                      placeholder="Fornavn"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="quick-lastName" className="text-sm">Etternavn *</Label>
                    <Input
                      id="quick-lastName"
                      value={quickCustomer.lastName}
                      onChange={(e) => setQuickCustomer({ ...quickCustomer, lastName: e.target.value })}
                      placeholder="Etternavn"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quick-phone" className="text-sm">Telefon *</Label>
                  <Input
                    id="quick-phone"
                    value={quickCustomer.phone}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, phone: e.target.value })}
                    placeholder="+47 xxx xx xxx"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quick-email" className="text-sm">E-post (valgfritt)</Label>
                  <Input
                    id="quick-email"
                    type="email"
                    value={quickCustomer.email}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, email: e.target.value })}
                    placeholder="epost@example.com"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (!quickCustomer.firstName || !quickCustomer.lastName || !quickCustomer.phone) {
                      toast.error("Vennligst fyll ut fornavn, etternavn og telefon");
                      return;
                    }
                    createCustomerMutation.mutate({
                      firstName: quickCustomer.firstName,
                      lastName: quickCustomer.lastName,
                      phone: quickCustomer.phone,
                      email: quickCustomer.email || undefined,
                    });
                  }}
                  disabled={createCustomerMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createCustomerMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Opprett og velg kunde
                </Button>
              </div>
            ) : (
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Velg kunde" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.customers?.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.firstName} {customer.lastName} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Tjeneste *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Velg tjeneste" />
              </SelectTrigger>
              <SelectContent>
                {services?.map((service: any) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - {service.duration} min - {parseFloat(service.price).toFixed(0)} kr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">Frisør *</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger id="staff">
                <SelectValue placeholder="Velg frisør" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((member: any) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Dato *</Label>
              <Input
                id="date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Starttid *</Label>
              <Input
                id="time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notater (valgfritt)</Label>
            <Textarea
              id="notes"
              placeholder="Eventuelle notater om avtalen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Recurring Appointments */}
          <div className="space-y-3 p-4 border rounded-lg bg-amber-50">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4 text-amber-600" />
                Gjenta avtale
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pattern" className="text-sm">Mønster</Label>
                    <Select value={recurrencePattern} onValueChange={(val) => setRecurrencePattern(val as "weekly" | "monthly")}>
                      <SelectTrigger id="pattern">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Ukentlig</SelectItem>
                        <SelectItem value="monthly">Månedlig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count" className="text-sm">Antall ganger</Label>
                    <Input
                      id="count"
                      type="number"
                      min="2"
                      max="12"
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-100 p-2 rounded">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {recurrenceCount} avtaler vil bli opprettet {recurrencePattern === "weekly" ? "hver uke" : "hver måned"} fra {appointmentDate || "valgt dato"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Opprett Avtale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
