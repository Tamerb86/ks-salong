import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Pencil, Trash2, Calendar, Clock, User, Phone } from "lucide-react";
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
import { toast } from "sonner";

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  // Fetch appointments
  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery();
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
        </div>
      </div>
    </Layout>
  );
}
