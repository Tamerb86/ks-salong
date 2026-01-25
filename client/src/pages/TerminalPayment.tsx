import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type PaymentStatus = "idle" | "creating" | "processing" | "success" | "failed";

export default function TerminalPayment() {
  const [selectedReader, setSelectedReader] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [receiptData, setReceiptData] = useState<any>(null);

  // Fetch available readers
  const { data: readers, isLoading: loadingReaders } = trpc.terminal.listReaders.useQuery();

  // Mutations
  const createPaymentMutation = trpc.terminal.createPaymentIntent.useMutation();
  const processPaymentMutation = trpc.terminal.processPayment.useMutation();
  const cancelPaymentMutation = trpc.terminal.cancelPayment.useMutation();

  const handlePayment = async () => {
    if (!selectedReader) {
      toast.error("Vennligst velg en terminal");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Vennligst skriv inn et gyldig beløp");
      return;
    }

    try {
      // Step 1: Create Payment Intent
      setPaymentStatus("creating");
      const paymentIntent = await createPaymentMutation.mutateAsync({
        amount: amountValue,
      });

      if (!paymentIntent.paymentIntentId) {
        throw new Error("Failed to create payment intent");
      }

      setPaymentIntentId(paymentIntent.paymentIntentId);

      // Step 2: Process Payment on Reader
      setPaymentStatus("processing");
      toast.info("Venter på betaling på terminal...");

      const result = await processPaymentMutation.mutateAsync({
        readerId: selectedReader,
        paymentIntentId: paymentIntent.paymentIntentId,
      });

      if (result.success) {
        setPaymentStatus("success");
        setReceiptData({
          amount: amountValue,
          paymentIntentId: paymentIntent.paymentIntentId,
          timestamp: new Date(),
        });
        toast.success("Betaling vellykket!");
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      toast.error(error.message || "Betaling mislyktes");
      console.error("Payment error:", error);
    }
  };

  const handleCancel = async () => {
    if (!selectedReader || !paymentIntentId) return;

    try {
      await cancelPaymentMutation.mutateAsync({
        readerId: selectedReader,
      });
      setPaymentStatus("idle");
      setPaymentIntentId("");
      toast.info("Betaling avbrutt");
    } catch (error: any) {
      toast.error("Kunne ikke avbryte betaling");
    }
  };

  const handleReset = () => {
    setPaymentStatus("idle");
    setAmount("");
    setPaymentIntentId("");
    setReceiptData(null);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terminal Betaling</h1>

      <div className="grid gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Behandle Betaling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reader Selection */}
            <div className="space-y-2">
              <Label htmlFor="reader">Velg Terminal</Label>
              {loadingReaders ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Laster terminaler...
                </div>
              ) : readers && readers.length > 0 ? (
                <Select
                  value={selectedReader}
                  onValueChange={setSelectedReader}
                  disabled={paymentStatus !== "idle"}
                >
                  <SelectTrigger id="reader">
                    <SelectValue placeholder="Velg en terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {readers.map((reader: any) => (
                      <SelectItem key={reader.id} value={reader.id}>
                        {reader.label} ({reader.deviceType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Ingen terminaler funnet. Vennligst registrer en terminal i innstillingene.
                  </p>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Beløp (NOK)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={paymentStatus !== "idle"}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {paymentStatus === "idle" && (
                <Button
                  onClick={handlePayment}
                  className="flex-1"
                  disabled={!selectedReader || !amount}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Behandle Betaling
                </Button>
              )}

              {(paymentStatus === "creating" || paymentStatus === "processing") && (
                <>
                  <Button disabled className="flex-1">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {paymentStatus === "creating" ? "Oppretter betaling..." : "Venter på terminal..."}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Avbryt
                  </Button>
                </>
              )}

              {(paymentStatus === "success" || paymentStatus === "failed") && (
                <Button onClick={handleReset} className="flex-1">
                  Ny Betaling
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {paymentStatus !== "idle" && (
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentStatus === "creating" && (
                <div className="flex items-center gap-3 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Oppretter betaling...</span>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="flex items-center gap-3 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <div>
                    <p className="font-medium">Venter på betaling</p>
                    <p className="text-sm text-gray-500">
                      Kunden kan nå betale på terminalen
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === "success" && receiptData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Betaling vellykket!</span>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Beløp:</span>
                      <span className="font-medium">{receiptData.amount.toFixed(2)} NOK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tidspunkt:</span>
                      <span className="font-medium">
                        {receiptData.timestamp.toLocaleString("no-NO")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transaksjon ID:</span>
                      <span className="font-mono text-xs">{receiptData.paymentIntentId}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Betaling mislyktes</p>
                    <p className="text-sm text-gray-500">
                      Vennligst prøv igjen eller kontakt support
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Guide */}
        {(!readers || readers.length === 0) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertCircle className="h-5 w-5" />
                Oppsett av Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800">
              <p>For å bruke Terminal Betaling, følg disse trinnene:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Gå til Innstillinger → Betaling</li>
                <li>Aktiver "Stripe Terminal"</li>
                <li>Legg inn Terminal Location ID fra Stripe Dashboard</li>
                <li>Registrer WisePOS E reader i Stripe Dashboard</li>
                <li>Kom tilbake hit for å behandle betalinger</li>
              </ol>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/settings" className="flex items-center gap-2">
                  Gå til Innstillinger
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
