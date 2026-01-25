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
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Key, Loader2, Users, Pencil, Trash2, Calendar, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Staff() {
  const { data: staff, isLoading } = trpc.staff.list.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
  
  // Staff PIN management
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [pinFormData, setPinFormData] = useState({ pin: "" });
  
  // Staff edit management
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barber" as "owner" | "manager" | "barber" | "cashier",
    isActive: true,
    skillLevel: "intermediate" as "beginner" | "intermediate" | "expert",
    durationMultiplier: "1.00",
    bookingSlotInterval: 15,
    breakStartTime: "",
    breakEndTime: "",
  });
  
  // Leave management
  const [isLeavesDialogOpen, setIsLeavesDialogOpen] = useState(false);
  const [selectedStaffForLeaves, setSelectedStaffForLeaves] = useState<any>(null);
  const [isAddLeaveDialogOpen, setIsAddLeaveDialogOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: "vacation" as "vacation" | "sick" | "personal" | "other",
    startDate: "",
    endDate: "",
    reason: "",
  });
  
  // Add employee management
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [addEmployeeFormData, setAddEmployeeFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barber" as "barber" | "cashier" | "manager",
    skillLevel: "intermediate" as "beginner" | "intermediate" | "expert",
    durationMultiplier: "1.00",
    bookingSlotInterval: "15",
  });

  const updatePinMutation = trpc.staff.update.useMutation({
    onSuccess: () => {
      toast.success("PIN oppdatert!");
      setIsPinDialogOpen(false);
      setPinFormData({ pin: "" });
      setEditingStaff(null);
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering: " + error.message);
    },
  });
  
  const updateStaffMutation = trpc.staff.update.useMutation({
    onSuccess: () => {
      toast.success("Ansatt oppdatert!");
      setIsEditDialogOpen(false);
      setEditingStaff(null);
    },
    onError: (error) => {
      toast.error("Feil ved oppdatering: " + error.message);
    },
  });
  
  const deleteStaffMutation = trpc.staff.delete.useMutation({
    onSuccess: () => {
      toast.success("Ansatt slettet!");
    },
    onError: (error) => {
      toast.error("Feil ved sletting: " + error.message);
    },
  });
  
  const createStaffMutation = trpc.staff.create.useMutation({
    onSuccess: () => {
      toast.success("Ansatt lagt til!");
      setIsAddEmployeeDialogOpen(false);
      setAddEmployeeFormData({
        name: "",
        email: "",
        phone: "",
        role: "barber",
        skillLevel: "intermediate",
        durationMultiplier: "1.00",
        bookingSlotInterval: "15",
      });
    },
    onError: (error) => {
      toast.error("Feil ved oppretting: " + error.message);
    },
  });
  
  // Leave management mutations
  const createLeaveMutation = trpc.staff.createLeave.useMutation({
    onSuccess: () => {
      toast.success("Ferie registrert!");
      setIsAddLeaveDialogOpen(false);
      setLeaveFormData({
        leaveType: "vacation",
        startDate: "",
        endDate: "",
        reason: "",
      });
    },
    onError: (error) => {
      toast.error("Feil ved registrering: " + error.message);
    },
  });
  
  const deleteLeaveMutation = trpc.staff.deleteLeave.useMutation({
    onSuccess: () => {
      toast.success("Ferie slettet!");
    },
    onError: (error) => {
      toast.error("Feil ved sletting: " + error.message);
    },
  });

  const handleOpenPinDialog = (staffMember: any) => {
    setEditingStaff(staffMember);
    setPinFormData({ pin: staffMember.pin || "" });
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinFormData.pin || pinFormData.pin.length < 4 || pinFormData.pin.length > 6) {
      toast.error("PIN må være mellom 4 og 6 sifre");
      return;
    }
    updatePinMutation.mutate({
      id: editingStaff.id,
      pin: pinFormData.pin,
    });
  };
  
  const handleOpenEditDialog = (staffMember: any) => {
    setEditingStaff(staffMember);
    setEditFormData({
      name: staffMember.name || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      role: staffMember.role || "barber",
      isActive: staffMember.isActive ?? true,
      skillLevel: staffMember.skillLevel || "intermediate",
      durationMultiplier: staffMember.durationMultiplier || "1.00",
      bookingSlotInterval: staffMember.bookingSlotInterval || 15,
      breakStartTime: staffMember.breakStartTime || "",
      breakEndTime: staffMember.breakEndTime || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.email) {
      toast.error("Navn og e-post er påkrevd");
      return;
    }
    updateStaffMutation.mutate({
      id: editingStaff.id,
      ...editFormData,
    });
  };
  
  const handleOpenLeavesDialog = (staffMember: any) => {
    setSelectedStaffForLeaves(staffMember);
    setIsLeavesDialogOpen(true);
  };
  
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFormData.startDate || !leaveFormData.endDate) {
      toast.error("Start- og sluttdato er påkrevd");
      return;
    }
    createLeaveMutation.mutate({
      staffId: selectedStaffForLeaves.id,
      ...leaveFormData,
    });
  };
  
  const handleDeleteLeave = (leaveId: number) => {
    if (confirm("Er du sikker på at du vil slette denne ferien?")) {
      deleteLeaveMutation.mutate({ id: leaveId });
    }
  };
  
  const handleDelete = (staffMember: any) => {
    if (window.confirm(`Er du sikker på at du vil slette ${staffMember.name}?`)) {
      deleteStaffMutation.mutate({ id: staffMember.id });
    }
  };
  
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmployeeFormData.name || !addEmployeeFormData.email || !addEmployeeFormData.phone) {
      toast.error("Navn, e-post og telefon er påkrevd");
      return;
    }
    createStaffMutation.mutate({
      ...addEmployeeFormData,
      bookingSlotInterval: parseInt(addEmployeeFormData.bookingSlotInterval),
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
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
                      Ansatte
                    </h1>
                    <LiveBadge text="Live" />
                  </div>
                  <p className="text-gray-600 mt-1">
                    Administrer ansatte og deres PIN-koder for tidsstempling
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsAddEmployeeDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Legg til ansatt
              </Button>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff?.map((member: any) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{member.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPinDialog(member)}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Key className="h-4 w-4 mr-1" />
                        PIN
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenLeavesDialog(member)}
                        className="border-green-300 text-green-600 hover:bg-green-50"
                        title="Administrer feriedager"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditDialog(member)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(member)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <span className="font-medium">{member.phone || "Ikke satt"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rolle:</span>
                      <span className="font-medium capitalize">{member.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PIN:</span>
                      <span className="font-medium">
                        {member.pin ? "****" + member.pin.slice(-2) : "Ikke satt"}
                      </span>
                    </div>
                    {member.role === "barber" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ferdighetsnivå:</span>
                          <span className="font-medium">
                            {member.skillLevel === "beginner" && "Nybegynner"}
                            {member.skillLevel === "intermediate" && "Middels"}
                            {member.skillLevel === "expert" && "Ekspert"}
                            {!member.skillLevel && "Middels"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Varighet:</span>
                          <span className="font-medium">
                            {member.durationMultiplier ? `${(parseFloat(member.durationMultiplier) * 100).toFixed(0)}%` : "100%"}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {staff?.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Ingen ansatte funnet</p>
            </Card>
          )}
        </div>

        {/* PIN Dialog */}
        <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handlePinSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-600" />
                  Sett PIN for {editingStaff?.name}
                </DialogTitle>
                <DialogDescription>
                  Ansatte bruker PIN-koden for å stemple inn/ut og logge inn på POS
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN-kode (4-6 sifre)</Label>
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pinFormData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPinFormData({ pin: value });
                    }}
                    placeholder="Skriv inn PIN"
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500">
                    Ansatte bruker denne PIN-koden for å stemple inn/ut og logge inn på POS
                  </p>
                </div>
                
                {editingStaff?.pin && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ Endring av PIN vil overskrive eksisterende PIN
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPinDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                  disabled={updateStaffMutation.isPending}
                >
                  {updateStaffMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Lagre PIN
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-600" />
                  Rediger {editingStaff?.name}
                </DialogTitle>
                <DialogDescription>
                  Oppdater informasjon for ansatt
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Navn *</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Fullt navn"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">E-post *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="epost@eksempel.no"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefon</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+47 xxx xx xxx"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rolle</Label>
                  <select
                    id="edit-role"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="barber">Frisør</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Kasserer</option>
                    <option value="owner">Eier</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-skill">Ferdighetsnivå</Label>
                  <select
                    id="edit-skill"
                    value={editFormData.skillLevel}
                    onChange={(e) => {
                      const skill = e.target.value as "beginner" | "intermediate" | "expert";
                      // Auto-set duration multiplier based on skill level
                      const multipliers = { beginner: "1.50", intermediate: "1.00", expert: "0.80" };
                      setEditFormData({ 
                        ...editFormData, 
                        skillLevel: skill,
                        durationMultiplier: multipliers[skill]
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Nybegynner (50% lengre tid)</option>
                    <option value="intermediate">Middels (normal tid)</option>
                    <option value="expert">Ekspert (20% raskere)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-multiplier">Varighet multiplikator</Label>
                  <Input
                    id="edit-multiplier"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="2.0"
                    value={editFormData.durationMultiplier}
                    onChange={(e) => setEditFormData({ ...editFormData, durationMultiplier: e.target.value })}
                    placeholder="1.00"
                  />
                  <p className="text-xs text-gray-500">
                    1.0 = normal tid, 1.5 = 50% lengre, 0.8 = 20% raskere
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-slot-interval">Tidsintervall for booking (minutter)</Label>
                  <select
                    id="edit-slot-interval"
                    value={editFormData.bookingSlotInterval}
                    onChange={(e) => setEditFormData({ ...editFormData, bookingSlotInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="15">15 minutter</option>
                    <option value="30">30 minutter</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Bestemmer hvor ofte tidspunkter vises i online booking
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-break-start">Pausetid start (valgfritt)</Label>
                  <Input
                    id="edit-break-start"
                    type="time"
                    value={editFormData.breakStartTime || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, breakStartTime: e.target.value })}
                    placeholder="12:00"
                  />
                  <p className="text-xs text-gray-500">
                    Start på pausetid (f.eks. 12:00)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-break-end">Pausetid slutt (valgfritt)</Label>
                  <Input
                    id="edit-break-end"
                    type="time"
                    value={editFormData.breakEndTime || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, breakEndTime: e.target.value })}
                    placeholder="13:00"
                  />
                  <p className="text-xs text-gray-500">
                    Slutt på pausetid (f.eks. 13:00)
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    id="edit-active"
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="edit-active" className="cursor-pointer">
                    Aktiv ansatt
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={updateStaffMutation.isPending}
                >
                  {updateStaffMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Lagre endringer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Leaves Management Dialog */}
        <Dialog open={isLeavesDialogOpen} onOpenChange={setIsLeavesDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Feriedager for {selectedStaffForLeaves?.name}
              </DialogTitle>
              <DialogDescription>
                Administrer feriedager, sykemelding og andre fraværsperioder
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Button
                onClick={() => setIsAddLeaveDialogOpen(true)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Legg til ny ferie
              </Button>
              
              <div className="space-y-2">
                <LeavesList 
                  staffId={selectedStaffForLeaves?.id} 
                  onDelete={handleDeleteLeave}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Add Leave Dialog */}
        <Dialog open={isAddLeaveDialogOpen} onOpenChange={setIsAddLeaveDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddLeave}>
              <DialogHeader>
                <DialogTitle>Registrer ny ferie</DialogTitle>
                <DialogDescription>
                  Legg til en ny ferieperiode for {selectedStaffForLeaves?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Type</Label>
                  <select
                    id="leave-type"
                    value={leaveFormData.leaveType}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="vacation">Ferie</option>
                    <option value="sick">Sykmelding</option>
                    <option value="personal">Personlig</option>
                    <option value="other">Annet</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-date">Startdato</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">Sluttdato</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Årsak (valgfritt)</Label>
                  <Input
                    id="reason"
                    type="text"
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                    placeholder="F.eks. Sommerferie"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddLeaveDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  disabled={createLeaveMutation.isPending}
                >
                  {createLeaveMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Registrer ferie
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Add Employee Dialog */}
        <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddEmployee}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                  Legg til ny ansatt
                </DialogTitle>
                <DialogDescription>
                  Fyll inn informasjon om den nye ansatte
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Navn *</Label>
                  <Input
                    id="add-name"
                    type="text"
                    value={addEmployeeFormData.name}
                    onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, name: e.target.value })}
                    placeholder="Fullt navn"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-email">E-post *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addEmployeeFormData.email}
                    onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, email: e.target.value })}
                    placeholder="epost@eksempel.no"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Telefon *</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    value={addEmployeeFormData.phone}
                    onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, phone: e.target.value })}
                    placeholder="+47 xxx xx xxx"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-role">Rolle *</Label>
                  <select
                    id="add-role"
                    value={addEmployeeFormData.role}
                    onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="barber">Frisør</option>
                    <option value="cashier">Kasserer</option>
                    <option value="manager">Leder</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-skillLevel">Ferdighetsnivå</Label>
                  <select
                    id="add-skillLevel"
                    value={addEmployeeFormData.skillLevel}
                    onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, skillLevel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Nybegynner</option>
                    <option value="intermediate">Middels</option>
                    <option value="expert">Ekspert</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-durationMultiplier">Varighetsmultiplikator</Label>
                    <Input
                      id="add-durationMultiplier"
                      type="text"
                      value={addEmployeeFormData.durationMultiplier}
                      onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, durationMultiplier: e.target.value })}
                      placeholder="1.00"
                    />
                    <p className="text-xs text-gray-500">1.0 = normal, 1.2 = 20% langsommere</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-bookingSlotInterval">Tidsintervall (min)</Label>
                    <Input
                      id="add-bookingSlotInterval"
                      type="number"
                      value={addEmployeeFormData.bookingSlotInterval}
                      onChange={(e) => setAddEmployeeFormData({ ...addEmployeeFormData, bookingSlotInterval: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddEmployeeDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                  disabled={createStaffMutation.isPending}
                >
                  {createStaffMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Legg til ansatt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// LeavesList component to display staff leaves
function LeavesList({ staffId, onDelete }: { staffId?: number; onDelete: (id: number) => void }) {
  const { data: leaves, isLoading } = trpc.staff.listLeaves.useQuery(
    { staffId },
    { enabled: !!staffId }
  );
  
  if (isLoading) {
    return <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }
  
  if (!leaves || leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Ingen feriedager registrert</p>
      </div>
    );
  }
  
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "vacation": return "Ferie";
      case "sick": return "Sykmelding";
      case "personal": return "Personlig";
      case "other": return "Annet";
      default: return type;
    }
  };
  
  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "vacation": return "bg-green-100 text-green-800";
      case "sick": return "bg-red-100 text-red-800";
      case "personal": return "bg-blue-100 text-blue-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-2">
      {leaves.map((leave: any) => (
        <Card key={leave.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                  {getLeaveTypeLabel(leave.leaveType)}
                </span>
              </div>
              <p className="text-sm font-medium">
                {new Date(leave.startDate).toLocaleDateString("no-NO")} - {new Date(leave.endDate).toLocaleDateString("no-NO")}
              </p>
              {leave.reason && (
                <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(leave.id)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
