import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { CreateAppointmentDialog } from "@/components/CreateAppointmentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Pencil, Trash2, Calendar, Clock, User, Phone, CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [terminalPaymentDialogOpen, setTerminalPaymentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [selectedReader, setSelectedReader] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "creating" | "processing" | "success" | "failed">("idle");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

  // Fetch appointments and readers
  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery();
  const { data: readers, isLoading: loadingReaders } = trpc.terminal.listReaders.useQuery();
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
  const cancelMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Avtale kansellert!");
      refetch();
      setCancelDialogOpen(false);
    },
    onError: () => {
      toast.error("Kunne ikke kansellere avtale");
    },
  });

  // Terminal payment mutations
  const createPaymentMutation = trpc.terminal.createPaymentIntent.useMutation();
  const processPaymentMutation = trpc.terminal.processPayment.useMutation();
  const cancelPaymentMutation = trpc.terminal.cancelPayment.useMutation();

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    const date = new Date(appointment.appointmentDate);
    setEditDate(format(date, "yyyy-MM-dd"));
    setEditTime(appointment.startTime);
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
  };

  const handleTerminalPayment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setTerminalPaymentDialogOpen(true);
    setPaymentStatus("idle");
    setSelectedReader("");
    setPaymentIntentId("");
  };

  const handleProcessTerminalPayment = async () => {
    if (!selectedAppointment || !selectedReader) {
      toast.error("Vennligst velg en terminal");
      return;
    }

    const amount = selectedAppointment.servicePrice || 0;
    if (amount <= 0) {
      toast.error("Ugyldig beløp");
      return;
    }

    try {
      // Step 1: Create Payment Intent
      setPaymentStatus("creating");
      const paymentIntent = await createPaymentMutation.mutateAsync({ amount });

      if (!paymentIntent.paymentIntentId) {
        throw new Error("Failed to create payment intent");
      }

      setPaymentIntentId(paymentIntent.paymentIntentId);

      // Step 2: Process Payment on Reader
      setPaymentStatus("processing");
      toast.info("Venter på betaling på terminal...");

      const result = await processPaymentMutation.mutateAsync({
        readerId: selectedReader,
        paymentIntentId: paymentIntent.paymentIntentId,
      });

      if (result.success) {
        setPaymentStatus("success");
        toast.success("Betaling vellykket!");
        
        // Update appointment payment status
        await updateMutation.mutateAsync({
          id: selectedAppointment.id,
          paymentStatus: "paid",
        });
        
        refetch();
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          setTerminalPaymentDialogOpen(false);
        }, 2000);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      toast.error(error.message || "Betaling mislyktes");
      console.error("Payment error:", error);
    }
  };

  const handleCancelTerminalPayment = async () => {
    if (!selectedReader || !paymentIntentId) {
      setTerminalPaymentDialogOpen(false);
      return;
    }

    try {
      await cancelPaymentMutation.mutateAsync({ readerId: selectedReader });
      toast.info("Betaling avbrutt");
    } catch (error: any) {
      toast.error("Kunne ikke avbryte betaling");
    }
    setTerminalPaymentDialogOpen(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

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
          </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Ny Avtale
            </Button>

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
              <MonthlyCalendar />
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
                              {apt.status === "confirmed" && apt.paymentStatus !== "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTerminalPayment(apt)}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Betal med Terminal
                                </Button>
                              )}
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

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rediger avtale</DialogTitle>
                <DialogDescription>
                  Endre dato eller tid for avtalen
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Dato</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Tid</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Lagrer..." : "Lagre endringer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Confirmation Dialog */}
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kanseller avtale?</AlertDialogTitle>
                <AlertDialogDescription>
                  Er du sikker på at du vil kansellere denne avtalen? Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmCancel}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Kansellerer..." : "Ja, kanseller"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Terminal Payment Dialog */}
          <Dialog open={terminalPaymentDialogOpen} onOpenChange={setTerminalPaymentDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Betal med Terminal
                </DialogTitle>
                <DialogDescription>
                  {selectedAppointment && (
                    <div className="mt-2 space-y-1">
                      <p className="font-medium text-gray-900">{selectedAppointment.customerName}</p>
                      <p className="text-sm">{selectedAppointment.serviceName}</p>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedAppointment.servicePrice?.toFixed(2)} kr
                      </p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>

              {paymentStatus === "idle" && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reader-select">Velg Terminal</Label>
                    {loadingReaders ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Laster terminaler...
                      </div>
                    ) : readers && readers.length > 0 ? (
                      <Select value={selectedReader} onValueChange={setSelectedReader}>
                        <SelectTrigger id="reader-select">
                          <SelectValue placeholder="Velg en terminal" />
                        </SelectTrigger>
                        <SelectContent>
                          {readers.map((reader: any) => (
                            <SelectItem key={reader.id} value={reader.id}>
                              {reader.label} ({reader.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-red-600">
                        Ingen terminaler funnet. Konfigurer Terminal Location i innstillinger.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentStatus === "creating" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  <p className="text-sm text-gray-600">Oppretter betaling...</p>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  <p className="text-sm font-medium text-gray-900">Venter på betaling</p>
                  <p className="text-xs text-gray-600">Følg instruksjonene på terminalen</p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Betaling vellykket!</p>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                  <p className="text-sm font-medium text-red-600">Betaling mislyktes</p>
                  <p className="text-xs text-gray-600">Vennligst prøv igjen</p>
                </div>
              )}

              <DialogFooter>
                {paymentStatus === "idle" && (
                  <>
                    <Button variant="outline" onClick={() => setTerminalPaymentDialogOpen(false)}>
                      Avbryt
                    </Button>
                    <Button
                      onClick={handleProcessTerminalPayment}
                      disabled={!selectedReader || createPaymentMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {createPaymentMutation.isPending ? "Behandler..." : "Start betaling"}
                    </Button>
                  </>
                )}
                {paymentStatus === "processing" && (
                  <Button variant="outline" onClick={handleCancelTerminalPayment}>
                    Avbryt betaling
                  </Button>
                )}
                {(paymentStatus === "success" || paymentStatus === "failed") && (
                  <Button onClick={() => setTerminalPaymentDialogOpen(false)}>
                    Lukk
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          toast.success("Avtale opprettet og lagt til i listen!");
        }}
      />

      </div>
    </Layout>
  );
}
