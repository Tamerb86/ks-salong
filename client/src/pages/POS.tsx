import { useAuth } from "@/_core/hooks/useAuth";
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
import { DollarSign, Minus, Plus, Printer, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
  type: "service" | "product";
  id: number;
  name: string;
  price: number;
  quantity: number;
  duration?: number;
  staffId?: number;
  staffName?: string;
}

export default function POS() {
  const { user, loading: authLoading } = useAuth();
  
  // Employee state - default to current logged-in user
  const [activeEmployee, setActiveEmployee] = useState<any>(user);
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

  // Fetch data
  const { data: services = [] } = trpc.services.list.useQuery(undefined, { enabled: !authLoading });
  const { data: products = [] } = trpc.products.list.useQuery(undefined, { enabled: !authLoading });
  const { data: staff = [] } = trpc.staff.list.useQuery(undefined, { enabled: !authLoading });
  const { data: activeEmployees = [] } = trpc.staff.listActive.useQuery();
  const { data: customers = [] } = trpc.customers.search.useQuery(
    { query: customerSearch },
    { enabled: customerSearch.length > 2 }
  );

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Ordre opprettet!");
      setLastReceipt(data);
      setIsReceiptOpen(true);
      // Clear cart
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
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const taxableAmount = subtotal - discountAmount;
    return taxableAmount * 0.25; // 25% MVA
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

    if (!customerId) {
      toast.error("Velg en kunde");
      return;
    }

    const orderItems = cart.map((item) => ({
      itemType: item.type,
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
      taxRate: "0.25",
      total: (item.price * item.quantity).toString(),
    }));

    createOrderMutation.mutate({
      customerId,
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

  const printReceipt = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Ingen tilgang</CardTitle>
            <CardDescription>Du må logge inn for å se denne siden</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Direct access - no PIN required
  
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
                {customerId && (
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-700">Kunde valgt</Badge>
                  </div>
                )}
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
                      <span className="font-medium">{calculateSubtotal().toFixed(2)} kr</span>
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
                    <Select
                      value={paymentMethod}
                      onValueChange={(value: any) => setPaymentMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Kontant</SelectItem>
                        <SelectItem value="card">Kort</SelectItem>
                        <SelectItem value="vipps">Vipps</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending || !customerId}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kvittering</DialogTitle>
            <DialogDescription>Ordre #{lastReceipt?.id}</DialogDescription>
          </DialogHeader>
          {lastReceipt && (
            <div className="space-y-4 py-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">K.S Salong</h2>
                <p className="text-sm text-gray-600">Professional Hair Salon</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(), "dd.MM.yyyy HH:mm")}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium border-b pb-2">
                  <span>Vare/Tjeneste</span>
                  <span>Beløp</span>
                </div>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} kr</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-sm border-t pt-2">
                <div className="flex justify-between">
                  <span>Delsum:</span>
                  <span>{calculateSubtotal().toFixed(2)} kr</span>
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
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Totalt:</span>
                  <span>{calculateTotal().toFixed(2)} kr</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Betalingsmetode: {paymentMethod.toUpperCase()}</p>
                <p className="mt-2">Takk for besøket!</p>
              </div>
            </div>
          )}
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
    </Layout>
  );
}
