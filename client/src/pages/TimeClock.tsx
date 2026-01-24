import { useAuth } from "@/_core/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { format, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { Clock, Coffee, LogIn, LogOut, Edit, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TimeClock() {
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const utils = trpc.useUtils();

  // Fetch current clock status
  const { data: currentStatus } = trpc.timeTracking.getCurrentStatus.useQuery(
    undefined,
    { enabled: !authLoading && !!user, refetchInterval: 30000 }
  );

  // Fetch daily logs for selected date
  const { data: dailyLogs = [] } = trpc.timeTracking.getDailyLogs.useQuery(
    { date: new Date(selectedDate) },
    { enabled: !authLoading && !!user }
  );

  // Fetch all staff (for managers)
  const { data: staff = [] } = trpc.staff.list.useQuery(
    undefined,
    { enabled: !authLoading && user?.role === 'owner' || user?.role === 'manager' }
  );

  const clockInMutation = trpc.timeTracking.clockIn.useMutation({
    onSuccess: () => {
      toast.success("Stemplet inn!");
      utils.timeTracking.getCurrentStatus.invalidate();
      utils.timeTracking.getDailyLogs.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke stemple inn");
    },
  });

  const clockOutMutation = trpc.timeTracking.clockOut.useMutation({
    onSuccess: () => {
      toast.success("Stemplet ut!");
      utils.timeTracking.getCurrentStatus.invalidate();
      utils.timeTracking.getDailyLogs.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke stemple ut");
    },
  });

  const startBreakMutation = trpc.timeTracking.startBreak.useMutation({
    onSuccess: () => {
      toast.success("Pause startet");
      utils.timeTracking.getCurrentStatus.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke starte pause");
    },
  });

  const endBreakMutation = trpc.timeTracking.endBreak.useMutation({
    onSuccess: () => {
      toast.success("Pause avsluttet");
      utils.timeTracking.getCurrentStatus.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke avslutte pause");
    },
  });

  const updateEntryMutation = trpc.timeTracking.updateEntry.useMutation({
    onSuccess: () => {
      toast.success("Oppføring oppdatert");
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      utils.timeTracking.getDailyLogs.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke oppdatere oppføring");
    },
  });

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOut = () => {
    clockOutMutation.mutate();
  };

  const handleStartBreak = () => {
    startBreakMutation.mutate();
  };

  const handleEndBreak = () => {
    endBreakMutation.mutate();
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const clockInTime = formData.get("clockInTime") as string;
    const clockOutTime = formData.get("clockOutTime") as string;
    const notes = formData.get("notes") as string;

    updateEntryMutation.mutate({
      id: editingEntry.id,
      clockInTime: clockInTime ? new Date(`${selectedDate}T${clockInTime}`) : undefined,
      clockOutTime: clockOutTime ? new Date(`${selectedDate}T${clockOutTime}`) : undefined,
      notes: notes || undefined,
    });
  };

  const calculateDuration = (clockIn: Date, clockOut: Date | null, breakMinutes: number = 0) => {
    if (!clockOut) return "Pågår...";
    const totalMinutes = differenceInMinutes(clockOut, clockIn) - breakMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}t ${minutes}m`;
  };

  const calculateTotalHours = () => {
    let totalMinutes = 0;
    dailyLogs.forEach((log: any) => {
      if (log.clockOutTime) {
        const minutes = differenceInMinutes(
          new Date(log.clockOutTime),
          new Date(log.clockInTime)
        ) - (log.breakMinutes || 0);
        totalMinutes += minutes;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}t ${minutes}m`;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const exportTimesheet = () => {
    toast.info("Eksport funksjon kommer snart");
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

  const isManager = user.role === 'owner' || user.role === 'manager';

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tidsstempling</h1>
          <p className="text-gray-600 mt-1">Administrer arbeidstid og pauser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Clock In/Out */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Din status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStatus?.isClockedIn ? (
                  <>
                    <div className="text-center py-4">
                      <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                        Stemplet inn
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Siden: {currentStatus.clockInTime ? format(new Date(currentStatus.clockInTime), "HH:mm") : "-"}
                      </p>
                      {currentStatus.isOnBreak && (
                        <Badge className="bg-amber-100 text-amber-700 mt-2">
                          På pause
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {currentStatus.isOnBreak ? (
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={handleEndBreak}
                          disabled={endBreakMutation.isPending}
                        >
                          <Coffee className="h-4 w-4 mr-2" />
                          Avslutt pause
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleStartBreak}
                          disabled={startBreakMutation.isPending}
                        >
                          <Coffee className="h-4 w-4 mr-2" />
                          Start pause
                        </Button>
                      )}

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={handleClockOut}
                        disabled={clockOutMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Stemple ut
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <Badge className="bg-gray-100 text-gray-700 text-lg px-4 py-2">
                        Ikke stemplet inn
                      </Badge>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                      size="lg"
                      onClick={handleClockIn}
                      disabled={clockInMutation.isPending}
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Stemple inn
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">I dag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total tid:</span>
                    <span className="font-semibold">{calculateTotalHours()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oppføringer:</span>
                    <span className="font-semibold">{dailyLogs.length}</span>
                  </div>
                  {isWeekend(new Date(selectedDate)) && (
                    <Badge className="bg-amber-100 text-amber-700 w-full justify-center">
                      Helg - Overtid
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Daily Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selector */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daglig logg
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                    <Button variant="outline" size="icon" onClick={exportTimesheet}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dailyLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Ingen oppføringer for denne dagen</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ansatt</TableHead>
                          <TableHead>Inn</TableHead>
                          <TableHead>Ut</TableHead>
                          <TableHead>Pause</TableHead>
                          <TableHead>Varighet</TableHead>
                          <TableHead>Status</TableHead>
                          {isManager && <TableHead>Handlinger</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyLogs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.staffName || user.name}
                            </TableCell>
                            <TableCell>
                              {format(new Date(log.clockInTime), "HH:mm")}
                            </TableCell>
                            <TableCell>
                              {log.clockOutTime
                                ? format(new Date(log.clockOutTime), "HH:mm")
                                : "-"}
                            </TableCell>
                            <TableCell>{log.breakMinutes || 0} min</TableCell>
                            <TableCell>
                              {calculateDuration(
                                new Date(log.clockInTime),
                                log.clockOutTime ? new Date(log.clockOutTime) : null,
                                log.breakMinutes || 0
                              )}
                            </TableCell>
                            <TableCell>
                              {log.clockOutTime ? (
                                <Badge className="bg-gray-100 text-gray-700">
                                  Fullført
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">
                                  Aktiv
                                </Badge>
                              )}
                            </TableCell>
                            {isManager && (
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditEntry(log)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sammendrag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {calculateTotalHours()}
                    </div>
                    <div className="text-sm text-gray-600">Total arbeidstid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {dailyLogs.reduce((sum: number, log: any) => sum + (log.breakMinutes || 0), 0)} min
                    </div>
                    <div className="text-sm text-gray-600">Total pause</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dailyLogs.filter((log: any) => log.clockOutTime).length}
                    </div>
                    <div className="text-sm text-gray-600">Fullførte økter</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog (Manager only) */}
      {isManager && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger tidsoppføring</DialogTitle>
              <DialogDescription>
                Endringer vil bli logget i revisjonsloggen
              </DialogDescription>
            </DialogHeader>
            {editingEntry && (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Ansatt</Label>
                  <Input value={editingEntry.staffName || user.name} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clockInTime">Inn-tid</Label>
                    <Input
                      id="clockInTime"
                      name="clockInTime"
                      type="time"
                      defaultValue={format(new Date(editingEntry.clockInTime), "HH:mm")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clockOutTime">Ut-tid</Label>
                    <Input
                      id="clockOutTime"
                      name="clockOutTime"
                      type="time"
                      defaultValue={
                        editingEntry.clockOutTime
                          ? format(new Date(editingEntry.clockOutTime), "HH:mm")
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notater</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Valgfri notater..."
                    defaultValue={editingEntry.notes || ""}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={updateEntryMutation.isPending}>
                    Lagre endringer
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
      </div>
    </Layout>
  );
}
