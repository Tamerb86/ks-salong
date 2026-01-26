/**
 * Barcode Scanner Component
 * Supports camera scanning and manual input for product barcodes/SKU
 */

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, X, Keyboard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  title = "Skann strekkode",
  description = "Bruk kameraet til å skanne produktets strekkode eller skriv inn manuelt"
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && mode === "camera") {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, mode]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use back camera on mobile
      });
      setHasPermission(true);
      
      // Initialize code reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoElement = videoRef.current;
      if (!videoElement) return;

      // Start decoding from video stream
      codeReaderRef.current.decodeFromVideoDevice(
        null, // Use default device
        videoElement,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            toast.success(`Strekkode skannet: ${barcodeText}`);
            onScan(barcodeText);
            stopScanning();
            onClose();
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error("Barcode scan error:", error);
          }
        }
      );
    } catch (error: any) {
      console.error("Failed to start scanning:", error);
      setHasPermission(false);
      
      if (error.name === "NotAllowedError") {
        toast.error("Kameratilgang nektet. Vennligst aktiver kamera i nettleserinnstillingene.");
      } else if (error.name === "NotFoundError") {
        toast.error("Ingen kamera funnet på enheten.");
      } else {
        toast.error("Kunne ikke starte kamera: " + error.message);
      }
      
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error("Vennligst skriv inn en strekkode");
      return;
    }
    
    onScan(manualInput.trim());
    setManualInput("");
    onClose();
  };

  const handleClose = () => {
    stopScanning();
    setManualInput("");
    setMode("camera");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "camera" ? (
              <Camera className="h-5 w-5 text-purple-600" />
            ) : (
              <Keyboard className="h-5 w-5 text-purple-600" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "camera" ? "default" : "outline"}
              onClick={() => setMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Kamera
            </Button>
            <Button
              type="button"
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manuell
            </Button>
          </div>

          {/* Camera Mode */}
          {mode === "camera" && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-purple-500 rounded-lg" style={{ width: "80%", height: "40%" }}>
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                    </div>
                  </div>
                )}
                
                {!isScanning && hasPermission === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <X className="h-12 w-12 mb-2 text-red-500" />
                    <p className="font-medium">Kameratilgang nektet</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Aktiver kamera i nettleserinnstillingene for å skanne strekkoder
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 text-center">
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Skanner... Hold strekkoden foran kameraet
                  </span>
                ) : (
                  "Klikk 'Start skanning' for å begynne"
                )}
              </p>

              {!isScanning && hasPermission !== false && (
                <Button
                  onClick={startScanning}
                  className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start skanning
                </Button>
              )}
            </div>
          )}

          {/* Manual Mode */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="manual-barcode" className="text-sm font-medium">
                  Strekkode / SKU
                </label>
                <Input
                  id="manual-barcode"
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Skriv inn strekkode eller SKU"
                  autoFocus
                  className="text-lg text-center tracking-wider"
                />
                <p className="text-xs text-gray-500">
                  Skriv inn produktets strekkode eller SKU-nummer manuelt
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                >
                  Søk
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
