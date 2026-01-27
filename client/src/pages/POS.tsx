import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { formatReceipt, printToThermalPrinter, isThermalPrinterSupported } from "@/lib/escpos-printer";
import { DollarSign, Minus, Plus, Printer, Search, ShoppingCart, Trash2, X, Scan, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "@/styles/print-receipt.css";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface CartItem {
  type: "service" | "product";
  id: number;
  name: string;
  price: number;
  cost?: number; // Cost price for profit calculation
  quantity: number;
  duration?: number;
  staffId?: number;
  staffName?: string;
}

export default function POS() {
  
  
  // Fetch salon settings for receipt
  const { data: settings } = trpc.settings.get.useQuery();
  
  // Employee state - default to current logged-in user
  const [activeEmployee, setActiveEmployee] = useState<any>(null);
  const [isSwitchEmployeeOpen, setIsSwitchEmployeeOpen] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "vipps" | "stripe">("cash");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Print options state
  const [printOptions, setPrintOptions] = useState({
    paperSize: "80mm" as "80mm" | "A4" | "A5",
    showLogo: true,
    showVAT: true,
    showEmployee: true,
    copies: 1,
    customMessage: "",
  });

  // Fetch data
  const { data: services = [] } = trpc.services.list.useQuery(undefined, { enabled: true });
  const { data: products = [] } = trpc.products.list.useQuery(undefined, { enabled: true });
  const { data: staff = [] } = trpc.staff.list.useQuery(undefined, { enabled: true });
  const { data: activeEmployees = [] } = trpc.staff.listActive.useQuery();
  const { data: customers = [] } = trpc.customers.search.useQuery(
    { query: customerSearch },
    { enabled: customerSearch.length > 2 }
  );

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Ordre opprettet!");
      // Store receipt data with current cart and payment info BEFORE clearing
      setLastReceipt({
        ...data,
        cartItems: [...cart], // Save cart items before clearing
        discount,
        tip,
        paymentMethod,
        employeeName: activeEmployee?.name
      });
      setIsReceiptOpen(true);
      // Clear cart AFTER saving to receipt
      setCart([]);
      setCustomerId(null);
      setDiscount(0);
      setTip(0);
    },
    onError: (error: any) => {
      toast.error(error.message || "Kunne ikke opprette ordre");
    },
  });
  
  const handleEmployeeSwitch = (employee: any) => {
    setActiveEmployee(employee);
    setIsSwitchEmployeeOpen(false);
    toast.success(`Byttet til ${employee.name}`);
  };
  
  const handleSwitchEmployee = (employeeId: number) => {
    const employee = activeEmployees.find((e: any) => e.id === employeeId);
    if (employee) {
      setActiveEmployee(employee);
      setIsSwitchEmployeeOpen(false);
      toast.success(`Byttet til ${employee.name}`);
    }
  };

  const addToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex(
      (i) => i.type === item.type && i.id === item.id && i.staffId === item.staffId
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} lagt til i handlekurv`);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    toast.success("Fjernet fra handlekurv");
  };

  const handleBarcodeScan = (barcode: string) => {
    // Search for product by SKU
    const product = products.find((p: any) => p.sku === barcode);
    
    if (product) {
      addToCart({
        type: "product",
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        cost: product.cost ? parseFloat(product.cost) : 0,
        quantity: 1,
      });
      toast.success(`${product.name} lagt til i handlekurv`);
    } else {
      toast.error(`Produkt med strekkode ${barcode} ikke funnet`);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percent") {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateMVA = () => {
    // Prices already include MVA, so we extract it
    // If price is 450 kr (with 25% MVA), then:
    // Price before MVA = 450 / 1.25 = 360 kr
    // MVA = 450 - 360 = 90 kr
    const subtotal = calculateSubtotal(); // Total with MVA
    const discountAmount = calculateDiscount();
    const totalWithMVA = subtotal - discountAmount;
    const totalBeforeMVA = totalWithMVA / 1.25;
    return totalWithMVA - totalBeforeMVA; // Extract MVA
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return subtotal - discountAmount + tip;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Handlekurven er tom");
      return;
    }

    // Customer is now optional for guest/walk-in sales

    console.log('[POS] Cart before creating order:', cart);
    const orderItems = cart.map((item) => {
      console.log('[POS] Mapping item:', item.name, 'price:', item.price, 'type:', typeof item.price);
      return {
        itemType: item.type,
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price.toString(),
        costPrice: item.cost?.toString() || "0.00", // Add cost price for profit calculation
        taxRate: "0.25",
        total: (item.price * item.quantity).toString(),
      };
    });
    console.log('[POS] Order items to send:', orderItems);

    createOrderMutation.mutate({
      customerId: customerId || undefined,
      items: orderItems,
      subtotal: calculateSubtotal().toString(),
      taxAmount: calculateMVA().toString(),
      discountAmount: calculateDiscount() > 0 ? calculateDiscount().toString() : undefined,
      tipAmount: tip > 0 ? tip.toString() : undefined,
      total: calculateTotal().toString(),
      employeeId: activeEmployee?.id,
      employeeName: activeEmployee?.name,
    });
  };

  const printReceipt = async () => {
    // Check if thermal printer is selected and supported
    if (printOptions.paperSize === '80mm' && isThermalPrinterSupported()) {
      try {
        // Use ESC/POS for thermal printer
        const receiptData = formatReceipt({
          salonName: settings?.salonName || 'K.S Salong',
          salonAddress: settings?.salonAddress || '',
          salonPhone: settings?.salonPhone || '',
          salonEmail: settings?.salonEmail || '',
          mvaNumber: settings?.mvaNumber || '',
          orderNumber: lastReceipt?.orderNumber || '',
          date: format(new Date(), 'dd.MM.yyyy'),
          time: format(new Date(), 'HH:mm'),
          items: (lastReceipt?.cartItems || []).map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price * item.quantity,
          })),
          subtotal: lastReceipt?.order ? parseFloat(lastReceipt.order.subtotal) / 1.25 : 0,
          mva: lastReceipt?.order ? parseFloat(lastReceipt.order.taxAmount) : 0,
          total: lastReceipt?.order ? parseFloat(lastReceipt.order.total) : 0,
          paymentMethod: lastReceipt?.paymentMethod?.toUpperCase() || 'KONTANT',
          customMessage: settings?.receiptMessage || printOptions.customMessage || undefined,
        });
        
        await printToThermalPrinter(receiptData);
        toast.success('Kvittering sendt til termisk skriver');
      } catch (error) {
        console.error('Thermal printer error:', error);
        toast.error(error instanceof Error ? error.message : 'Feil ved utskrift');
        // Fallback to browser print
        window.print();
      }
    } else {
      // Use browser print for A4/A5
      window.print();
    }
  };


  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">POS / Kasse</h1>
            <p className="text-gray-600 mt-1">Behandle salg og betalinger</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Innlogget som</p>
              <p className="font-semibold text-purple-600">{activeEmployee?.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSwitchEmployeeOpen(true)}
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Bytt ansatt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSwitchEmployeeOpen(true)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Logg ut
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Products & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kunde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomerId(null);
                      setCustomerSearch("Walk-in Customer");
                      toast.success("Walk-in kunde valgt");
                    }}
                    className="whitespace-nowrap"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Walk-in
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Søk kunde (navn, telefon, e-post)..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10"
                    />
                    {customerSearch.length > 2 && customers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {customers.map((customer: any) => (
                          <button
                            key={customer.id}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setCustomerId(customer.id);
                              setCustomerSearch(customer.name);
                            }}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <p className="text-sm text-gray-600">
                              {customer.phone || "Ingen telefon"} • {customer.email || "Ingen e-post"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {customerId && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCustomerId(null);
                        setCustomerSearch("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-2">
                  {customerId ? (
                    <Badge className="bg-green-100 text-green-700">Kunde valgt</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      Walk-in kunde (valgfritt)
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products & Services Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produkter & Tjenester</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="services">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="services">Tjenester</TabsTrigger>
                    <TabsTrigger value="products">Produkter</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.map((service: any) => (
                          <Card
                            key={service.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              // Show staff selection dialog
                              const staffId = staff.find(s => s.role === 'barber')?.id;
                              const staffName = staff.find(s => s.id === staffId)?.name || undefined;
                              console.log('[POS] Adding service to cart:', service.name, 'price:', service.price, 'parsed:', parseFloat(service.price));
                              addToCart({
                                type: "service",
                                id: service.id,
                                name: service.name,
                                price: parseFloat(service.price),
                                quantity: 1,
                                duration: service.duration,
                                staffId,
                                staffName,
                              });
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {service.duration} min
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-purple-600">
                                    {service.price} kr
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="products" className="mt-4">
                    {/* Barcode Scanner Button */}
                    <div className="mb-4">
                      <Button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                        size="lg"
                      >
                        <Scan className="h-5 w-5 mr-2" />
                        Skann strekkode
                      </Button>
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {products.map((product: any) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() =>
                              addToCart({
                                type: "product",
                                id: product.id,
                                name: product.name,
                                price: parseFloat(product.price),
                                cost: product.cost ? parseFloat(product.cost) : 0,
                                quantity: 1,
                              })
                            }
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Lager: {product.stockQuantity || 0}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-purple-600">
                                    {product.price} kr
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Handlekurv ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Handlekurven er tom</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {cart.map((item, index) => (
                        <div
                          key={`${item.type}-${item.id}-${index}`}
                          className="p-3 border rounded-lg bg-white"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              {item.staffName && (
                                <p className="text-xs text-gray-600">Med: {item.staffName}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {item.price} kr × {item.quantity}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => removeFromCart(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(index, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(index, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="font-bold text-purple-600">
                              {(item.price * item.quantity).toFixed(2)} kr
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Discount & Tip */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rabatt & Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rabatt</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <Select
                        value={discountType}
                        onValueChange={(value: "percent" | "fixed") => setDiscountType(value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">kr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tips</Label>
                    <Input
                      type="number"
                      min="0"
                      value={tip}
                      onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary & Payment */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Betaling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delsum:</span>
                      <span className="font-medium">{(calculateSubtotal() / 1.25).toFixed(2)} kr</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Rabatt:</span>
                        <span>-{calculateDiscount().toFixed(2)} kr</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>MVA (25%):</span>
                      <span>{calculateMVA().toFixed(2)} kr</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Tips:</span>
                        <span>+{tip.toFixed(2)} kr</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Totalt:</span>
                      <span className="text-purple-600">{calculateTotal().toFixed(2)} kr</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Betalingsmetode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={paymentMethod === "cash" ? "default" : "outline"}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                        onClick={() => setPaymentMethod("cash")}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="text-xs">Kontant</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "card" ? "default" : "outline"}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                        onClick={() => setPaymentMethod("card")}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-xs">Kort</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "vipps" ? "default" : "outline"}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                        onClick={() => setPaymentMethod("vipps")}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                        </svg>
                        <span className="text-xs">Vipps</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "stripe" ? "default" : "outline"}
                        className="h-16 flex flex-col items-center justify-center gap-1"
                        onClick={() => setPaymentMethod("stripe")}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                        </svg>
                        <span className="text-xs">Stripe</span>
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending || cart.length === 0}
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    {createOrderMutation.isPending ? "Behandler..." : "Fullfør betaling"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kvittering</DialogTitle>
            <DialogDescription>Faktura #{lastReceipt?.orderNumber}</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Forhåndsvisning</TabsTrigger>
              <TabsTrigger value="options">Utskriftsalternativer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
          {lastReceipt && (
            <div className={`receipt-print space-y-4 py-4 print:p-4 print-${printOptions.paperSize}`}>
              <div className="text-center border-b pb-4 print:border-dashed">
                {printOptions.showLogo && (
                  <div className="mb-2">
                    <h2 className="text-xl font-bold print:text-2xl">{settings?.salonName || 'K.S Salong'}</h2>
                    <p className="text-sm text-gray-600">Professional Hair Salon</p>
                  </div>
                )}
                {settings?.salonAddress && (
                  <p className="text-xs text-gray-500 mt-1">Adresse: {settings.salonAddress}</p>
                )}
                {settings?.salonPhone && (
                  <p className="text-xs text-gray-500">Telefon: {settings.salonPhone}</p>
                )}
                {settings?.salonEmail && (
                  <p className="text-xs text-gray-500">E-post: {settings.salonEmail}</p>
                )}
                {settings?.mvaNumber && (
                  <p className="text-xs text-gray-500">MVA: {settings.mvaNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  Faktura: {lastReceipt.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  Dato: {format(new Date(), "dd.MM.yyyy HH:mm")}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium border-b pb-2">
                  <span>Vare/Tjeneste</span>
                  <span>Beløp</span>
                </div>
                {(lastReceipt?.cartItems || []).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} kr</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-sm border-t pt-2 print:border-dashed">
                {printOptions.showVAT && lastReceipt?.order && (
                  <div className="flex justify-between">
                    <span>Delsum (eks. MVA):</span>
                    <span>{(parseFloat(lastReceipt.order.subtotal) / 1.25).toFixed(2)} kr</span>
                  </div>
                )}
                {lastReceipt?.discount && lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Rabatt:</span>
                    <span>-{lastReceipt.discount.toFixed(2)} kr</span>
                  </div>
                )}
                {printOptions.showVAT && lastReceipt?.order && (
                  <div className="flex justify-between font-medium">
                    <span>MVA (25%):</span>
                    <span>{parseFloat(lastReceipt.order.taxAmount).toFixed(2)} kr</span>
                  </div>
                )}
                {printOptions.showVAT && lastReceipt?.order && (
                  <div className="flex justify-between">
                    <span>Delsum (inkl. MVA):</span>
                    <span>{parseFloat(lastReceipt.order.subtotal).toFixed(2)} kr</span>
                  </div>
                )}
                {lastReceipt?.tip && lastReceipt.tip > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tips:</span>
                    <span>+{lastReceipt.tip.toFixed(2)} kr</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 print:border-double print:border-t-2">
                  <span>Totalt å betale:</span>
                  <span>{lastReceipt?.order ? parseFloat(lastReceipt.order.total).toFixed(2) : '0.00'} kr</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 border-t pt-4 print:border-dashed">
                <p className="font-medium">Betalingsmetode: {lastReceipt?.paymentMethod?.toUpperCase() || 'KONTANT'}</p>
                {printOptions.showEmployee && lastReceipt?.employeeName && (
                  <p className="mt-1">Betjent av: {lastReceipt.employeeName}</p>
                )}
                {settings?.receiptMessage ? (
                  <p className="mt-3 font-medium whitespace-pre-line">{settings.receiptMessage}</p>
                ) : printOptions.customMessage ? (
                  <p className="mt-3 font-medium">{printOptions.customMessage}</p>
                ) : (
                  <>
                    <p className="mt-3 font-medium">Takk for besøket!</p>
                    <p className="mt-1">Velkommen tilbake!</p>
                  </>
                )}
              </div>
            </div>
          )}
            </TabsContent>
            
            <TabsContent value="options" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Papirstørrelse</Label>
                  <Select
                    value={printOptions.paperSize}
                    onValueChange={(value: "80mm" | "A4" | "A5") =>
                      setPrintOptions({ ...printOptions, paperSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm (Termisk skriver)</SelectItem>
                      <SelectItem value="A4">A4 (Standard)</SelectItem>
                      <SelectItem value="A5">A5 (Halv side)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Innhold</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showLogo"
                      checked={printOptions.showLogo}
                      onChange={(e) =>
                        setPrintOptions({ ...printOptions, showLogo: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="showLogo" className="font-normal cursor-pointer">
                      Vis logo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showVAT"
                      checked={printOptions.showVAT}
                      onChange={(e) =>
                        setPrintOptions({ ...printOptions, showVAT: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="showVAT" className="font-normal cursor-pointer">
                      Vis MVA-detaljer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showEmployee"
                      checked={printOptions.showEmployee}
                      onChange={(e) =>
                        setPrintOptions({ ...printOptions, showEmployee: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="showEmployee" className="font-normal cursor-pointer">
                      Vis ansattinformasjon
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="copies">Antall kopier</Label>
                  <Input
                    id="copies"
                    type="number"
                    min="1"
                    max="10"
                    value={printOptions.copies}
                    onChange={(e) =>
                      setPrintOptions({ ...printOptions, copies: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customMessage">Tilpasset melding (valgfritt)</Label>
                  <Input
                    id="customMessage"
                    placeholder="F.eks: Takk for besøket!"
                    value={printOptions.customMessage}
                    onChange={(e) =>
                      setPrintOptions({ ...printOptions, customMessage: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>
              Lukk
            </Button>
            <Button onClick={printReceipt}>
              <Printer className="h-4 w-4 mr-2" />
              Skriv ut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Switch Employee Dialog */}
      <Dialog open={isSwitchEmployeeOpen} onOpenChange={setIsSwitchEmployeeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bytt ansatt</DialogTitle>
            <DialogDescription>
              Velg en ansatt å bytte til. Dette påvirker ikke tidsstempling.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto py-4">
            {activeEmployees.map((employee: any) => (
              <Button
                key={employee.id}
                variant="outline"
                className="h-20 text-left justify-start hover:bg-purple-50 hover:border-purple-300"
                onClick={() => handleSwitchEmployee(employee.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                    {employee.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">{employee.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
                  </div>
                  {activeEmployee?.id === employee.id && (
                    <Badge variant="default" className="bg-purple-600">Aktiv</Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSwitchEmployeeOpen(false)}>
              Avbryt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        title="Skann produktstrekkode"
        description="Skann produktets strekkode for å legge det til i handlekurven"
      />
    </Layout>
  );
}
