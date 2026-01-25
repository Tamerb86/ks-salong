import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Edit,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const TAG_OPTIONS = ["VIP", "Regular", "New", "Inactive", "Loyal", "HighValue", "AtRisk"] as const;

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-800",
  Regular: "bg-blue-100 text-blue-800",
  New: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Loyal: "bg-amber-100 text-amber-800",
  HighValue: "bg-pink-100 text-pink-800",
  AtRisk: "bg-red-100 text-red-800",
};

export default function CustomerProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const customerId = Number(params.id);

  const [newNote, setNewNote] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    preferences: "",
  });

  const utils = trpc.useUtils();

  const { data: customer, isLoading: customerLoading } = trpc.customers.getById.useQuery({ id: customerId });
  const { data: bookingHistory } = trpc.customers.getBookingHistory.useQuery({ customerId });
  const { data: statistics } = trpc.customers.getStatistics.useQuery({ customerId });
  const { data: notes } = trpc.customers.getNotes.useQuery({ customerId });
  const { data: tags } = trpc.customers.getTags.useQuery({ customerId });

  const addNoteMutation = trpc.customers.addNote.useMutation({
    onSuccess: () => {
      utils.customers.getNotes.invalidate({ customerId });
      setNewNote("");
      setShowAddNoteDialog(false);
    },
  });

  const deleteNoteMutation = trpc.customers.deleteNote.useMutation({
    onSuccess: () => {
      utils.customers.getNotes.invalidate({ customerId });
    },
  });

  const addTagMutation = trpc.customers.addTag.useMutation({
    onSuccess: () => {
      utils.customers.getTags.invalidate({ customerId });
      setSelectedTag("");
      setShowAddTagDialog(false);
    },
  });

  const deleteTagMutation = trpc.customers.deleteTag.useMutation({
    onSuccess: () => {
      utils.customers.getTags.invalidate({ customerId });
    },
  });

  const exportDataMutation = trpc.customers.exportData.useQuery(
    { customerId },
    { enabled: false }
  );

  const deleteDataMutation = trpc.customers.deleteData.useMutation({
    onSuccess: () => {
      setLocation("/customers");
    },
  });

  const updateCustomerMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.getById.invalidate({ id: customerId });
      setShowEditDialog(false);
    },
  });

  const handleEditClick = () => {
    if (customer) {
      setEditForm({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email || "",
        dateOfBirth: customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "yyyy-MM-dd") : "",
        address: customer.address || "",
        preferences: customer.preferences || "",
      });
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    updateCustomerMutation.mutate({
      id: customerId,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      email: editForm.email || undefined,
      dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth) : undefined,
      address: editForm.address || undefined,
      preferences: editForm.preferences || undefined,
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate({
      customerId,
      note: newNote,
    });
  };

  const handleAddTag = () => {
    if (!selectedTag) return;
    addTagMutation.mutate({
      customerId,
      tag: selectedTag as any,
    });
  };

  const handleExportData = async () => {
    const data = await exportDataMutation.refetch();
    if (data.data) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customer-${customerId}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteData = () => {
    deleteDataMutation.mutate({ customerId });
  };

  if (customerLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Kunde ikke funnet</h2>
            <Button onClick={() => setLocation("/customers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til kunder
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation("/customers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-500">Kundedetaljer</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Rediger
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Eksporter data
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Slett kunde
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Slett kunde?</DialogTitle>
                  <DialogDescription>
                    Dette vil permanent slette alle kundedata inkludert bookinger, notater og tags.
                    Denne handlingen kan ikke angres.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Avbryt
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteData}>
                    Slett permanent
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Customer Info & Stats */}
          <div className="md:col-span-1 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kontaktinformasjon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{format(new Date(customer.dateOfBirth), "dd.MM.yyyy", { locale: nb })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistikk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Totalt besøk</div>
                  <div className="text-2xl font-bold">{statistics?.totalVisits || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total omsetning</div>
                  <div className="text-2xl font-bold">{statistics?.totalSpending || 0} kr</div>
                </div>
                {statistics?.lastVisit && (
                  <div>
                    <div className="text-sm text-gray-500">Siste besøk</div>
                    <div className="text-sm font-medium">
                      {format(new Date(statistics.lastVisit), "dd.MM.yyyy", { locale: nb })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tags
                  </CardTitle>
                  <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Legg til tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select value={selectedTag} onValueChange={setSelectedTag}>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg tag" />
                          </SelectTrigger>
                          <SelectContent>
                            {TAG_OPTIONS.map((tag) => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddTagDialog(false)}>
                            Avbryt
                          </Button>
                          <Button onClick={handleAddTag} disabled={!selectedTag}>
                            Legg til
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags && tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className={TAG_COLORS[tag.tag] || "bg-gray-100 text-gray-800"}
                      >
                        {tag.tag}
                        <button
                          className="ml-2 hover:text-red-600"
                          onClick={() => deleteTagMutation.mutate({ id: tag.id })}
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Ingen tags</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notes & Booking History */}
          <div className="md:col-span-2 space-y-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interne notater</CardTitle>
                  <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nytt notat
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Legg til notat</DialogTitle>
                        <DialogDescription>
                          Notater er kun synlige for ansatte og lagres i kundens historikk.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Skriv notat her..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                            Avbryt
                          </Button>
                          <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                            Lagre notat
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes && notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">{note.note}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{note.createdByName}</span>
                              <span>•</span>
                              <span>
                                {format(new Date(note.createdAt), "dd.MM.yyyy HH:mm", { locale: nb })}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNoteMutation.mutate({ id: note.id })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Ingen notater ennå</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking History */}
            <Card>
              <CardHeader>
                <CardTitle>Bookinghistorikk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingHistory && bookingHistory.length > 0 ? (
                    bookingHistory.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{booking.serviceName}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(booking.appointmentDate), "dd.MM.yyyy", { locale: nb })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(booking.appointmentDate), "HH:mm")}
                            </span>
                            <span>{booking.staffName}</span>
                          </div>
                        </div>
                        <Badge
                          className={
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Ingen bookinger ennå</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Customer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rediger kundeinformasjon</DialogTitle>
              <DialogDescription>
                Oppdater kundens kontaktinformasjon og preferanser
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fornavn *</label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="Fornavn"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Etternavn *</label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Etternavn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon *</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+47 xxx xx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-post</label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="epost@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fødselsdato</label>
                  <Input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Gateadresse"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferanser / Notater</label>
                <Textarea
                  value={editForm.preferences}
                  onChange={(e) => setEditForm({ ...editForm, preferences: e.target.value })}
                  placeholder="Stilpreferanser, allergier, etc."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editForm.firstName || !editForm.lastName || !editForm.phone || updateCustomerMutation.isPending}
              >
                {updateCustomerMutation.isPending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
