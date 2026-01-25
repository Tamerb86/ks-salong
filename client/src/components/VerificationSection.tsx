import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function VerificationSection() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyMutation = trpc.orders.verifyFikenTotals.useQuery(
    { dateFrom, dateTo },
    { enabled: false }
  );

  const handleVerify = async () => {
    try {
      const result = await verifyMutation.refetch();
      if (result.data) {
        setVerificationResult(result.data);
        if (result.data.match) {
          toast.success("Totalene stemmer! ✓");
        } else {
          toast.warning(`Avvik funnet: ${result.data.difference.toFixed(2)} kr`);
        }
      }
    } catch (error: any) {
      toast.error("Feil ved verifisering: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Fra dato</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">Til dato</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleVerify}
        disabled={verifyMutation.isFetching}
        className="w-full"
      >
        {verifyMutation.isFetching && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        Verifiser totaler
      </Button>

      {verificationResult && (
        <div className="mt-4 space-y-3">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-lg border-2 ${
              verificationResult.match
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {verificationResult.match ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <span
                className={`font-semibold ${
                  verificationResult.match ? "text-green-900" : "text-yellow-900"
                }`}
              >
                {verificationResult.match
                  ? "Totalene stemmer!"
                  : "Avvik oppdaget"}
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    System
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">
                    Total (inkl. MVA)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">K.S Salong</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {verificationResult.ksSalongTotal.toFixed(2)} kr
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Fiken</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {verificationResult.fikenTotal.toFixed(2)} kr
                  </td>
                </tr>
                {!verificationResult.match && (
                  <tr className="border-t bg-yellow-50">
                    <td className="px-4 py-3 font-bold text-yellow-900">
                      Differanse
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-yellow-900">
                      {verificationResult.difference.toFixed(2)} kr
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!verificationResult.match && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Hva betyr dette?</strong>
                <br />
                Det er et avvik mellom K.S Salong og Fiken. Dette kan skyldes:
              </p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                <li>Ordre som ikke er synkronisert ennå</li>
                <li>Manuelle justeringer i Fiken</li>
                <li>Refunderte ordre</li>
              </ul>
              <p className="text-sm text-yellow-800 mt-2">
                Sjekk begge systemene for å finne årsaken.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
