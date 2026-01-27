import { useEffect } from "react";
import { format } from "date-fns";
import "@/styles/print-receipt.css";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptOrder {
  id: number;
  createdAt: Date;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

interface ReceiptCustomer {
  name?: string;
  phone?: string;
  email?: string;
}

interface ReceiptSalon {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

interface PrintableReceiptProps {
  order: ReceiptOrder;
  items: ReceiptItem[];
  customer?: ReceiptCustomer;
  salon: ReceiptSalon;
  autoPrint?: boolean;
}

export default function PrintableReceipt({
  order,
  items,
  customer,
  salon,
  autoPrint = false,
}: PrintableReceiptProps) {
  useEffect(() => {
    if (autoPrint) {
      // Auto-print after component mounts
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div className="receipt-print print-80mm">
      {/* Header */}
      <div className="text-center border-b pb-4 print:border-dashed">
        <h2 className="text-xl font-bold print:text-2xl">{salon.name}</h2>
        <p className="text-sm text-gray-600">Professional Hair Salon</p>
        
        {salon.address && (
          <p className="text-xs text-gray-500 mt-2">Adresse: {salon.address}</p>
        )}
        {salon.phone && (
          <p className="text-xs text-gray-500">Telefon: {salon.phone}</p>
        )}
        {salon.email && (
          <p className="text-xs text-gray-500">E-post: {salon.email}</p>
        )}
        
        <p className="text-xs text-gray-500 mt-2 font-mono">
          Faktura: #{order.id}
        </p>
        <p className="text-xs text-gray-500">
          Dato: {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
        </p>
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="border-b pb-2 mb-2 print:border-dashed">
          {customer.name && (
            <p className="text-sm">Kunde: {customer.name}</p>
          )}
          {customer.phone && (
            <p className="text-xs text-gray-500">Tlf: {customer.phone}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between font-medium border-b pb-2">
          <span>Vare/Tjeneste</span>
          <span>Beløp</span>
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{item.total.toFixed(2)} kr</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 text-sm border-t pt-2 print:border-dashed">
        <div className="flex justify-between">
          <span>Delsum (eks. MVA):</span>
          <span>{(order.subtotal / 1.25).toFixed(2)} kr</span>
        </div>
        <div className="flex justify-between">
          <span>MVA (25%):</span>
          <span>{order.tax.toFixed(2)} kr</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 print:border-double print:border-t-2">
          <span>Totalt:</span>
          <span>{order.total.toFixed(2)} kr</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4 print:border-dashed">
        <p>Takk for besøket!</p>
        <p className="mt-2">Velkommen tilbake!</p>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="mt-6 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Skriv ut
        </button>
      </div>
    </div>
  );
}
