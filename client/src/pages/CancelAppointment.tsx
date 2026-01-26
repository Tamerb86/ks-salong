import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Calendar, Clock, User, Scissors } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";

export default function CancelAppointment() {
  const params = useParams();
  const token = params.token as string;
  const [, setLocation] = useLocation();
  const [reason, setReason] = useState("");
  const [cancelled, setCancelled] = useState(false);

  const { data: appointment, isLoading, error } = trpc.appointments.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const cancelMutation = trpc.appointments.cancelByToken.useMutation({
    onSuccess: () => {
      setCancelled(true);
      toast.success("Avtalen er avbestilt");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCancel = () => {
    if (!token) return;
    cancelMutation.mutate({ token, reason: reason || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Ugyldig lenke</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Denne avbestillingskoden er ugyldig eller har utløpt. Vennligst kontakt oss direkte på +47 929 81 628.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/")} className="w-full">
              Tilbake til forsiden
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle>Avtalen er avbestilt</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Din avtale er nå avbestilt. Vi håper å se deg en annen gang!
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/")} className="w-full">
              Tilbake til forsiden
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const appointmentDateTime = new Date(appointment.appointmentDate);
  const [hours, minutes] = appointment.startTime.split(":");
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

  const now = new Date();
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilAppointment >= 24 && appointmentDateTime > now;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 p-4">
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent mb-2">
            K.S Salong
          </h1>
          <p className="text-muted-foreground">Avbestill avtale</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avtaledetaljer</CardTitle>
            <CardDescription>
              Vennligst bekreft at du ønsker å avbestille denne avtalen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Scissors className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tjeneste</p>
                  <p className="font-medium">{appointment.serviceName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Dato</p>
                  <p className="font-medium">
                    {format(appointmentDateTime, "EEEE d. MMMM yyyy", { locale: nb })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tid</p>
                  <p className="font-medium">{appointment.startTime}</p>
                </div>
              </div>

              {appointment.staffName && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frisør</p>
                    <p className="font-medium">{appointment.staffName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Policy Notice */}
            {!canCancel && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Avbestilling må gjøres minst 24 timer før avtalen
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Vennligst ring oss på +47 929 81 628 for å avbestille.
                </p>
              </div>
            )}

            {canCancel && (
              <>
                {/* Reason (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Grunn til avbestilling (valgfritt)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Fortell oss hvorfor du avbestiller..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Ved å avbestille denne avtalen frigjør du tiden for andre kunder. 
                    Handlingen kan ikke angres.
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="flex-1"
            >
              Tilbake
            </Button>
            {canCancel && (
              <Button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Avbestill avtale
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Har du spørsmål? Ring oss på <strong>+47 929 81 628</strong></p>
          <p className="mt-1">Storgata 122C, 3915 Porsgrunn</p>
        </div>
      </div>
    </div>
  );
}
