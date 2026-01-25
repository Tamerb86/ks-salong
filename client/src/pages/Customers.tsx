import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  TrendingUp,
  User,
  Users,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Customers() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const { data: customers, isLoading } = trpc.customers.list.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
  const { data: customerDetails } = trpc.customers.getById.useQuery(
    { id: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );
  const { data: bookingHistory } = trpc.customers.getBookingHistory.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );
  const { data: statistics } = trpc.customers.getStatistics.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );

  const utils = trpc.useUtils();
  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setCreateDialogOpen(false);
      setNewCustomer({ firstName: "", lastName: "", phone: "", email: "" });
    },
  });

  const filteredCustomers = customers?.customers?.filter((customer: any) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.firstName?.toLowerCase().includes(query) ||
      customer.lastName?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      checked_in: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Venter",
      confirmed: "Bekreftet",
      checked_in: "Ankommet",
      completed: "Fullført",
      cancelled: "Avbrutt",
      no_show: "Møtte ikke",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                    Kunder
                  </h1>
                  <LiveBadge text="Live" />
                </div>
                <p className="text-gray-600">Administrer kundedatabase og CRM</p>
              </div>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ny Kunde
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Søk etter kunde (navn, telefon, e-post)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Totalt antall kunder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {customers?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aktive kunder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {customers?.customers?.filter((c: any) => c.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Nye denne måneden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {customers?.customers?.filter((c: any) => {
                  const createdDate = new Date(c.createdAt);
                  const now = new Date();
                  return (
                    createdDate.getMonth() === now.getMonth() &&
                    createdDate.getFullYear() === now.getFullYear()
                  );
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Kundeliste</CardTitle>
            <CardDescription>
              Klikk på en kunde for å se detaljer og bookinghistorikk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/customers/${customer.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Registrert:{" "}
                        {format(new Date(customer.createdAt), "dd.MM.yyyy", {
                          locale: nb,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Ingen kunder funnet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Dialog */}
      <Dialog
        open={!!selectedCustomerId}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p>
                  {customerDetails?.firstName} {customerDetails?.lastName}
                </p>
                <p className="text-sm font-normal text-gray-600">
                  Kundedetaljer og historikk
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {customerDetails && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kontaktinformasjon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customerDetails.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>{customerDetails.phone}</span>
                    </div>
                  )}
                  {customerDetails.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>{customerDetails.email}</span>
                    </div>
                  )}
                  {customerDetails.address && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Adresse:</span>
                      <span>{customerDetails.address}</span>
                    </div>
                  )}
                  {customerDetails.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>
                        Født:{" "}
                        {format(new Date(customerDetails.dateOfBirth), "dd.MM.yyyy", {
                          locale: nb,
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              {statistics && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Totalt besøk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {statistics.totalVisits}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total omsetning
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-5 w-5" />
                        {statistics.totalSpending.toFixed(2)} kr
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Siste besøk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-semibold text-amber-600">
                        {statistics.lastVisit
                          ? format(new Date(statistics.lastVisit), "dd.MM.yyyy", {
                              locale: nb,
                            })
                          : "Ingen besøk"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bookinghistorikk</CardTitle>
                  <CardDescription>
                    Alle tidligere og kommende avtaler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingHistory && bookingHistory.length > 0 ? (
                    <div className="space-y-3">
                      {bookingHistory.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">
                                {booking.serviceName}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(booking.appointmentDate), "dd.MM.yyyy", {
                                  locale: nb,
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.startTime} - {booking.endTime}
                              </span>
                              {booking.staffName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {booking.staffName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-600">
                              {booking.servicePrice} kr
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Ingen bookinger funnet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {customerDetails.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notater</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{customerDetails.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Opprett ny kunde
            </DialogTitle>
            <DialogDescription>
              Fyll inn kundens informasjon. Telefonnummer er påkrevd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fornavn *</label>
                <Input
                  placeholder="Fornavn"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Etternavn *</label>
                <Input
                  placeholder="Etternavn"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefon *</label>
              <Input
                placeholder="Telefonnummer"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">E-post (valgfritt)</label>
              <Input
                type="email"
                placeholder="E-postadresse"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewCustomer({ firstName: "", lastName: "", phone: "", email: "" });
                }}
              >
                Avbryt
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                onClick={() => {
                  if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
                    return;
                  }
                  createCustomerMutation.mutate(newCustomer);
                }}
                disabled={
                  !newCustomer.firstName ||
                  !newCustomer.lastName ||
                  !newCustomer.phone ||
                  createCustomerMutation.isPending
                }
              >
                {createCustomerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oppretter...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Opprett kunde
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </Layout>
  );
}
