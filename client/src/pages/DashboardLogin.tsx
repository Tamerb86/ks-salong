import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function DashboardLogin() {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPinMutation = trpc.auth.loginWithPin.useMutation({
    onSuccess: (data: any) => {
      if (data.user) {
        // Store authentication in sessionStorage
        sessionStorage.setItem("dashboardAuth", JSON.stringify({
          userId: data.user.id,
          name: data.user.name,
          role: data.user.role,
          timestamp: Date.now()
        }));
        toast.success(`مرحباً ${data.user.name}!`);
        setLocation("/dashboard");
      } else {
        toast.error("رمز PIN غير صحيح");
        setPin("");
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التحقق من رمز PIN");
      setPin("");
      setIsLoading(false);
    },
  });

  const handlePinInput = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setPin(numericValue);

    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      handleSubmit(numericValue);
    }
  };

  const handleSubmit = (pinValue: string = pin) => {
    if (pinValue.length !== 6) {
      toast.error("يرجى إدخال رمز PIN مكون من 6 أرقام");
      return;
    }

    setIsLoading(true);
    verifyPinMutation.mutate({ pin: pinValue });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 6) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">دخول لوحة التحكم</CardTitle>
          <CardDescription>
            أدخل رمز PIN الخاص بك للوصول إلى لوحة الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••"
              className="text-center text-2xl tracking-widest font-bold h-16"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-sm text-gray-500 text-center">
              أدخل رمز PIN المكون من 6 أرقام
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "←", 0, "✓"].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="h-16 text-xl font-semibold"
                disabled={isLoading}
                onClick={() => {
                  if (num === "←") {
                    setPin(pin.slice(0, -1));
                  } else if (num === "✓") {
                    handleSubmit();
                  } else {
                    handlePinInput(pin + num);
                  }
                }}
              >
                {isLoading && num === "✓" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  num
                )}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setLocation("/")}
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
