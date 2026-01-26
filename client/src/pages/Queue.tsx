import { Layout } from "@/components/Layout";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Clock, Plus, User, X, Check, ArrowUp, ArrowDown, Calendar, Tv } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Queue() {
  
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any>(null);

  // Fetch active queue
  const { data: queue = [], refetch, isLoading: queueLoading } = trpc.queue.list.useQuery(undefined, { 
    enabled: true,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  // Fetch services and staff
  const { data: services = [] } = trpc.services.list.useQuery(undefined, { enabled: true });
  const { data: staff = [] } = trpc.staff.list.useQuery(undefined, { enabled: true });

  const addMutation = trpc.queue.add.useMutation({
    onSuccess: () => {
      toast.success("Kunde lagt til i køen");
      setIsAddCustomerOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke legge til kunde");
    },
  });

  const updateMutation = trpc.queue.update.useMutation({
    onSuccess: () => {
      toast.success("Kø oppdatert");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke oppdatere kø");
    },
  });



  const handleAddToQueue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const preferredStaffIdValue = formData.get("preferredStaffId") as string;
    const preferredStaffId = preferredStaffIdValue && preferredStaffIdValue !== "0" 
      ? parseInt(preferredStaffIdValue) 
      : undefined;
    
    addMutation.mutate({
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      serviceId: parseInt(formData.get("serviceId") as string),
      preferredStaffId,
    });
  };

  const moveUp = (id: number, currentPosition: number) => {
    if (currentPosition > 1) {
      // Will implement reorder functionality
      toast.info("Reorder funksjonalitet kommer snart");
    }
  };

  const moveDown = (id: number, currentPosition: number) => {
    if (currentPosition < queue.length) {
      // Will implement reorder functionality
      toast.info("Reorder funksjonalitet kommer snart");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "called":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "in_service":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "completed":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      waiting: "Venter",
      called: "Kalt opp",
      in_service: "Under behandling",
      completed: "Fullført",
    };
    return labels[status] || status;
  };

  const calculateWaitTime = (position: number) => {
    // Estimate 30 minutes per customer
    const minutes = position * 30;
    if (minutes < 60) {
      return `~${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `~${hours}t ${remainingMinutes}m`;
  };


  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Drop-in Kø</h1>
              <LiveBadge text="Live" />
            </div>
            <p className="text-gray-600 mt-1">Administrer walk-in kunder</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('/queue-tv', '_blank')}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Tv className="h-4 w-4 mr-2" />
              TV-visning
            </Button>
            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til i kø
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddToQueue}>
                <DialogHeader>
                  <DialogTitle>Legg til kunde i kø</DialogTitle>
                  <DialogDescription>
                    Fyll inn kundeinformasjon for walk-in
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Kundenavn *</Label>
                    <Input name="customerName" placeholder="Ola Nordmann" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerPhone">Telefon *</Label>
                    <Input name="customerPhone" type="tel" placeholder="+47 xxx xx xxx" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="serviceId">Tjeneste *</Label>
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
                    <Label htmlFor="preferredStaffId">Foretrukket ansatt (valgfritt)</Label>
                    <Select name="preferredStaffId">
                      <SelectTrigger>
                        <SelectValue placeholder="Ingen preferanse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Ingen preferanse</SelectItem>
                        {staff.filter(s => s.role === 'barber' || s.role === 'manager' || s.role === 'owner').map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notater (valgfritt)</Label>
                    <Input name="notes" placeholder="Spesielle ønsker..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Legger til..." : "Legg til i kø"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">I kø</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {queue.filter(q => q.status === "waiting").length}
              </div>
              <p className="text-xs text-blue-600 mt-1">Venter på service</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Under behandling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {queue.filter(q => q.status === "in_service").length}
              </div>
              <p className="text-xs text-green-600 mt-1">Blir behandlet nå</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Estimert ventetid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {calculateWaitTime(queue.filter(q => q.status === "waiting").length)}
              </div>
              <p className="text-xs text-purple-600 mt-1">For nye kunder</p>
            </CardContent>
          </Card>
        </div>

        {/* Queue List */}
        <Card>
          <CardHeader>
            <CardTitle>Aktiv kø</CardTitle>
            <CardDescription>
              {queue.length === 0 ? "Ingen kunder i køen" : `${queue.length} kunder i køen`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Ingen kunder i køen akkurat nå</p>
                <p className="text-sm text-gray-500 mt-2">
                  Klikk "Legg til i kø" for å legge til walk-in kunder
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((item: any, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedQueueItem(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                            {item.position}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveUp(item.id, item.position);
                              }}
                              disabled={item.position === 1}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDown(item.id, item.position);
                              }}
                              disabled={item.position === queue.length}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{item.customerName}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.customerPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.serviceName}
                            </span>
                            {item.preferredStaffName && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Ønsker: {item.preferredStaffName}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{calculateWaitTime(item.position)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Lagt til: {format(new Date(item.createdAt), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Item Details Dialog */}
        <Dialog open={!!selectedQueueItem} onOpenChange={() => setSelectedQueueItem(null)}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedQueueItem && (
              <>
                <DialogHeader>
                  <DialogTitle>Kø detaljer</DialogTitle>
                  <DialogDescription>
                    Posisjon #{selectedQueueItem.position} i køen
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={getStatusColor(selectedQueueItem.status)}>
                      {getStatusLabel(selectedQueueItem.status)}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Kunde:</strong> {selectedQueueItem.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Telefon:</strong> {selectedQueueItem.customerPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Tjeneste:</strong> {selectedQueueItem.serviceName}
                      </span>
                    </div>
                    {selectedQueueItem.preferredStaffName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Foretrukket ansatt:</strong> {selectedQueueItem.preferredStaffName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Estimert ventetid:</strong> {calculateWaitTime(selectedQueueItem.position)}
                      </span>
                    </div>
                    {selectedQueueItem.notes && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm">
                          <strong>Notater:</strong> {selectedQueueItem.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  {selectedQueueItem.status === "waiting" && (
                    <>
                      <Button
                        variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedQueueItem.id,
                          status: "waiting",
                        });
                        setSelectedQueueItem(null);
                      }}
                      >
                        Kall opp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          updateMutation.mutate({
                            id: selectedQueueItem.id,
                            status: "in_service",
                          });
                          setSelectedQueueItem(null);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Start behandling
                      </Button>
                    </>
                  )}
                  {selectedQueueItem.status === "called" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedQueueItem.id,
                          status: "in_service",
                        });
                        setSelectedQueueItem(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Start behandling
                    </Button>
                  )}
                  {selectedQueueItem.status === "in_service" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMutation.mutate({
                          id: selectedQueueItem.id,
                          status: "completed",
                        });
                        setSelectedQueueItem(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Fullfør
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Er du sikker på at du vil fjerne denne kunden fra køen?")) {
                        updateMutation.mutate({
                          id: selectedQueueItem.id,
                          status: "cancelled",
                        });
                        setSelectedQueueItem(null);
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Fjern fra kø
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
