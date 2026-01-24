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
import { Key, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

export default function Staff() {
  const { data: staff, isLoading } = trpc.staff.list.useQuery();
  
  // Staff PIN management
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [pinFormData, setPinFormData] = useState({ pin: "" });

  const updateStaffMutation = trpc.staff.update.useMutation({
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
    updateStaffMutation.mutate({
      id: editingStaff.id,
      pin: pinFormData.pin,
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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Ansatte
                </h1>
                <p className="text-gray-600 mt-1">
                  Administrer ansatte og deres PIN-koder for tidsstempling
                </p>
              </div>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff?.map((member: any) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{member.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPinDialog(member)}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Key className="h-4 w-4 mr-1" />
                      PIN
                    </Button>
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
      </div>
    </Layout>
  );
}
