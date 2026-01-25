import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Home, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Layout } from "@/components/Layout";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const [reference, setReference] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(true);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    
    if (ref) {
      setReference(ref);
    }
  }, []);

  // Query payment status
  const { data: paymentStatus, isLoading, error, refetch } = trpc.vipps.getPaymentStatus.useQuery(
    { reference: reference! },
    { 
      enabled: !!reference,
      refetchInterval: shouldPoll ? 2000 : false, // Poll every 2 seconds until final state
    }
  );

  // Stop polling when payment reaches final state
  useEffect(() => {
    if (paymentStatus && ["AUTHORIZED", "ABORTED", "EXPIRED", "TERMINATED"].includes(paymentStatus.state)) {
      setShouldPoll(false);
    }
  }, [paymentStatus]);

  const getStatusInfo = () => {
    if (!reference) {
      return {
        status: "failed" as const,
        message: "Manglende betalingsreferanse",
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        title: "Feil",
      };
    }

    if (isLoading || !paymentStatus) {
      return {
        status: "loading" as const,
        message: "Venter på betalingsbekreftelse...",
        icon: <Loader2 className="h-6 w-6 animate-spin text-purple-600" />,
        title: "Behandler betaling...",
      };
    }

    if (error) {
      return {
        status: "failed" as const,
        message: `Feil ved verifisering: ${error.message}`,
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        title: "Betaling mislyktes",
      };
    }

    if (paymentStatus.state === "AUTHORIZED") {
      return {
        status: "success" as const,
        message: "Betaling vellykket! Din booking er bekreftet.",
        icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
        title: "Betaling vellykket!",
      };
    }

    if (paymentStatus.state === "ABORTED") {
      return {
        status: "failed" as const,
        message: "Betalingen ble avbrutt. Vennligst prøv igjen.",
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        title: "Betaling avbrutt",
      };
    }

    if (paymentStatus.state === "EXPIRED" || paymentStatus.state === "TERMINATED") {
      return {
        status: "failed" as const,
        message: "Betalingen mislyktes eller utløp. Vennligst prøv igjen.",
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        title: "Betaling mislyktes",
      };
    }

    // Still pending
    return {
      status: "loading" as const,
      message: "Venter på betalingsbekreftelse...",
      icon: <Loader2 className="h-6 w-6 animate-spin text-purple-600" />,
      title: "Behandler betaling...",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              {statusInfo.icon}
              <span>{statusInfo.title}</span>
            </CardTitle>
            <CardDescription className="text-center">
              {statusInfo.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reference && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Referanse:</strong> {reference}
                </p>
              </div>
            )}

            {paymentStatus && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {paymentStatus.state}
                </p>
                {paymentStatus.authorizedAmount > 0 && (
                  <p className="text-sm text-gray-600">
                    <strong>Beløp:</strong> {(paymentStatus.authorizedAmount / 100).toFixed(2)} kr
                  </p>
                )}
              </div>
            )}

            {statusInfo.status === "success" && (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600">
                  Du vil motta en bekreftelse på SMS/e-post snart.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Hjem
                  </Button>
                  <Button
                    onClick={() => setLocation("/book-online")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book ny time
                  </Button>
                </div>
              </div>
            )}

            {statusInfo.status === "failed" && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Hjem
                </Button>
                <Button
                  onClick={() => setLocation("/book-online")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                >
                  Prøv igjen
                </Button>
              </div>
            )}

            {statusInfo.status === "loading" && (
              <div className="text-center text-sm text-gray-500">
                Dette kan ta noen sekunder...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
