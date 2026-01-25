import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clock, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DAYS = [
  { id: 0, name: "Søndag" },
  { id: 1, name: "Mandag" },
  { id: 2, name: "Tirsdag" },
  { id: 3, name: "Onsdag" },
  { id: 4, name: "Torsdag" },
  { id: 5, name: "Fredag" },
  { id: 6, name: "Lørdag" },
];

export function BusinessHoursTab() {
  const { data: businessHours, isLoading } = trpc.settings.getBusinessHours.useQuery();
  const updateMutation = trpc.settings.updateBusinessHours.useMutation({
    onSuccess: () => {
      toast.success("Åpningstider lagret!");
    },
    onError: (error) => {
      toast.error("Feil ved lagring: " + error.message);
    },
  });

  const [hours, setHours] = useState<Record<number, { isOpen: boolean; openTime: string; closeTime: string }>>({});

  useEffect(() => {
    if (businessHours) {
      const hoursMap: Record<number, { isOpen: boolean; openTime: string; closeTime: string }> = {};
      businessHours.forEach((day: any) => {
        hoursMap[day.dayOfWeek] = {
          isOpen: day.isOpen,
          openTime: day.openTime || "09:00",
          closeTime: day.closeTime || "19:45",
        };
      });
      setHours(hoursMap);
    }
  }, [businessHours]);

  const handleSave = async (dayOfWeek: number) => {
    const dayHours = hours[dayOfWeek];
    if (!dayHours) return;

    await updateMutation.mutateAsync({
      dayOfWeek,
      isOpen: dayHours.isOpen,
      openTime: dayHours.openTime,
      closeTime: dayHours.closeTime,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Laster...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Åpningstider
        </CardTitle>
        <CardDescription>
          Administrer åpningstider for hver dag i uken
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map((day) => {
          const dayHours = hours[day.id] || { isOpen: true, openTime: "09:00", closeTime: "19:45" };
          
          return (
            <div key={day.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24 font-medium">{day.name}</div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) => {
                    setHours({ ...hours, [day.id]: { ...dayHours, isOpen: checked } });
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {dayHours.isOpen ? "Åpen" : "Stengt"}
                </span>
              </div>

              {dayHours.isOpen && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`open-${day.id}`} className="text-sm">Fra:</Label>
                    <Input
                      id={`open-${day.id}`}
                      type="time"
                      value={dayHours.openTime}
                      onChange={(e) => {
                        setHours({ ...hours, [day.id]: { ...dayHours, openTime: e.target.value } });
                      }}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`close-${day.id}`} className="text-sm">Til:</Label>
                    <Input
                      id={`close-${day.id}`}
                      type="time"
                      value={dayHours.closeTime}
                      onChange={(e) => {
                        setHours({ ...hours, [day.id]: { ...dayHours, closeTime: e.target.value } });
                      }}
                      className="w-32"
                    />
                  </div>
                </>
              )}

              <Button
                size="sm"
                onClick={() => handleSave(day.id)}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                Lagre
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
