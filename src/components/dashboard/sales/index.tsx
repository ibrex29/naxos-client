'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockMedicines, mockCustomers } from "@/data/mockData";
import { Medicine, Customer, OrderItem } from "@/types";
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function PointOfSale() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'credit'>('cash');

  const filteredMedicines = mockMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicineId === medicine.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicineId === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 1,
        unitPrice: medicine.sellingPrice,
        discount: (medicine.sellingPrice * medicine.discountPercentage) / 100,
        batchId: medicine.batches[0]?.id || ''
      };
      setCart([...cart, newItem]);
    }
    toast.success(`Added ${medicine.name} to cart`);
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    
    setCart(cart.map(item =>
      item.medicineId === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicineId !== medicineId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const calculateTotalDiscount = () => {
    return cart.reduce((total, item) => total + (item.discount * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const customerDiscount = selectedCustomer ? (subtotal * selectedCustomer.loyaltyDiscount) / 100 : 0;
    return subtotal - discount - customerDiscount;
  };

  const processOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Simulate order processing
    toast.success('Order processed successfully!');
    setCart([]);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
        <p className="text-muted-foreground">
          Process customer orders and manage sales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Search</CardTitle>
              <CardDescription>Search and add medicines to cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by medicine name or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicines.slice(0, 6).map((medicine) => (
              <Card key={medicine.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">{medicine.brand}</p>
                    </div>
                    <Badge variant={medicine.stock > medicine.minThreshold ? 'default' : 'destructive'}>
                      {medicine.stock} units
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">${medicine.sellingPrice.toFixed(2)}</p>
                      {medicine.discountPercentage > 0 && (
                        <p className="text-sm text-green-600">{medicine.discountPercentage}% off</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(medicine)}
                      disabled={medicine.stock === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Cart is empty</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.medicineId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.medicineName}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.medicineId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select onValueChange={(value) => {
                    const customer = mockCustomers.find(c => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.loyaltyDiscount}% discount)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={(value: 'cash' | 'card' | 'credit') => setPaymentMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${calculateTotalDiscount().toFixed(2)}</span>
                  </div>
                  {selectedCustomer && selectedCustomer.loyaltyDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>Loyalty Discount:</span>
                      <span>-${((calculateSubtotal() * selectedCustomer.loyaltyDiscount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full" onClick={processOrder}>
                  Process Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}