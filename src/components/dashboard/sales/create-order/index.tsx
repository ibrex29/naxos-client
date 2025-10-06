/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Search, 
  ShoppingCart, 
  Package, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Building2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDistributors } from '@/hooks/use-distributors';
import { useInventory } from '@/hooks/use-stocks-management';
import { useCreateSalesOrder } from '@/hooks/use-sales';
import { DistributorType } from '@/app/api/service/distributorService';

// Define MedicineFormEnum
export enum MedicineFormEnum {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  SYRUP = "Syrup",
  INJECTION = "Injection",
  CREAM = "Cream",
  OINTMENT = "Ointment",
  DROPS = "Drops",
  INHALER = "Inhaler",
  SUPPOSITORY = "Suppository",
  POWDER = "Powder",
}

interface Medicine {
  id: string;
  name: string;
  strength: string;
  form: MedicineFormEnum;
  manufacturer: string;
  manufacturingDate: string;
  packSize: number;
  countryOfOrigin: string;
  shipmentItems: Array<{
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitCost: number;
  }>;
}

interface OrderItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
  batchNumber: string;
  availableStock: number;
}

export default function CreateOrderPage() {
  const { toast } = useToast();
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [distributorSearchTerm, setDistributorSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [medicineFormFilter, setMedicineFormFilter] = useState<MedicineFormEnum | 'all'>('all');
  const [distributorTypeFilter, setDistributorTypeFilter] = useState<DistributorType | 'all'>('all');

  // Fetch distributors with filters
  const { data: distributorsData, isLoading: loadingDistributors, error: distributorsError } = useDistributors({
    search: distributorSearchTerm,
    type: distributorTypeFilter === 'all' ? '' : distributorTypeFilter,
  });

  // Memoize distributors to prevent new array reference on every render
  const distributors = useMemo(() => {
    return distributorsData?.data.filter(distributor => {
      const isValid = Object.values(DistributorType).includes(distributor.type as DistributorType);
      if (!isValid) {
        console.warn(`Unexpected distributor type: ${distributor.type}`, distributor);
      }
      return true; // Allow all, but log invalid types
    }) || [];
  }, [distributorsData]); // Depend on distributorsData only

  // Fetch inventory with filters
  const { data: inventoryData, isLoading: loadingInventory, error: inventoryError } = useInventory({
    search: medicineSearchTerm,
    form: medicineFormFilter === 'all' ? '' : medicineFormFilter,
  });
  const medicines = inventoryData?.data || [];

  const loading = loadingDistributors || loadingInventory;

  // Mutation for creating order
  const createSalesOrderMutation = useCreateSalesOrder();

  // Handle fetch errors
  useEffect(() => {
    if (distributorsError) {
      console.error('Error fetching distributors:', distributorsError);
      toast({
        title: 'Error',
        description: 'Failed to load distributors. Please try again.',
        variant: 'destructive',
      });
    }
    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      toast({
        title: 'Error',
        description: 'Failed to load inventory. Please try again.',
        variant: 'destructive',
      });
    }
  }, [distributorsError, inventoryError, toast]);

  

  // Update currency when distributor is selected
  useEffect(() => {
    if (selectedDistributor) {
      const selectedDist = distributors.find(d => d.id === selectedDistributor);
      if (selectedDist?.currency) {
        setCurrency(selectedDist.currency as 'NGN' | 'USD');
      } else {
        setCurrency('NGN');
      }
    }
  }, [selectedDistributor, distributors]);

  const filteredMedicines = medicines.filter(medicine =>
    (medicineFormFilter === 'all' || medicine.form === medicineFormFilter) &&
    (medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
     medicine.manufacturer.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
     medicine.form.toLowerCase().includes(medicineSearchTerm.toLowerCase()))
  );

  const filteredDistributors = distributors.filter(distributor =>
    distributor.name.toLowerCase().includes(distributorSearchTerm.toLowerCase()) ||
    distributor.code.toLowerCase().includes(distributorSearchTerm.toLowerCase()) ||
    distributor.type.toLowerCase().includes(distributorSearchTerm.toLowerCase())
  );

  const addToCart = (medicine: Medicine) => {
    const batch = medicine.shipmentItems[0]; // Use first available batch
    if (!batch || batch.quantity <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'Medicine is out of stock',
        variant: 'destructive',
      });
      return;
    }

    const existingItem = cart.find(item => 
      item.medicineId === medicine.id && item.batchNumber === batch.batchNumber
    );

    if (existingItem) {
      if (existingItem.quantity >= batch.quantity) {
        toast({
          title: 'Stock Limit',
          description: 'Cannot exceed available stock',
          variant: 'destructive',
        });
        return;
      }
      updateCartQuantity(medicine.id, batch.batchNumber, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        medicineId: medicine.id,
        medicine,
        quantity: 1,
        unitPrice: batch.unitCost,
        batchNumber: batch.batchNumber,
        availableStock: batch.quantity
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (medicineId: string, batchNumber: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId, batchNumber);
      return;
    }

    setCart(cart.map(item => {
      if (item.medicineId === medicineId && item.batchNumber === batchNumber) {
        if (newQuantity > item.availableStock) {
          toast({
            title: 'Stock Limit',
            description: 'Cannot exceed available stock',
            variant: 'destructive',
          });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId: string, batchNumber: string) => {
    setCart(cart.filter(item => 
      !(item.medicineId === medicineId && item.batchNumber === batchNumber)
    ));
  };

  const updateUnitPrice = (medicineId: string, batchNumber: string, newPrice: number) => {
    if (newPrice < 0) {
      toast({
        title: 'Invalid Price',
        description: 'Unit price cannot be negative',
        variant: 'destructive',
      });
      return;
    }
    setCart(cart.map(item => {
      if (item.medicineId === medicineId && item.batchNumber === batchNumber) {
        return { ...item, unitPrice: newPrice };
      }
      return item;
    }));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const createOrder = async () => {
    if (!selectedDistributor) {
      toast({
        title: 'Selection Required',
        description: 'Please select a distributor',
        variant: 'destructive',
      });
      return;
    }

    const selectedDist = distributors.find(d => d.id === selectedDistributor);
    if (!selectedDist || !Object.values(DistributorType).includes(selectedDist.type)) {
      toast({
        title: 'Invalid Distributor',
        description: 'Selected distributor has an invalid type',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to the order',
        variant: 'destructive',
      });
      return;
    }

    const invalidItems = cart.filter(item => item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidItems.length > 0) {
      toast({
        title: 'Invalid Items',
        description: 'Some items have invalid quantity or price',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        distributorId: selectedDistributor,
        currency,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      console.log('Creating order with payload:', payload);
      await createSalesOrderMutation.mutateAsync(payload);
      toast({
        title: 'Success',
        description: 'Order created successfully!',
      });
      setCart([]);
      setSelectedDistributor('');
      setDistributorSearchTerm('');
      setMedicineFormFilter('all');
      setDistributorTypeFilter('all');
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingCart className="h-6 w-6" />
            Create Sales Order
          </h1>
          <p className="text-muted-foreground">
            Select products from available stock to create a new order
          </p>
        </div>
      </div>

      {(distributorsError || inventoryError) && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to load data. Please refresh the page or try again later.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search medicines..."
                        value={medicineSearchTerm}
                        onChange={(e) => setMedicineSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select 
                    value={medicineFormFilter} 
                    onValueChange={(value: string) => setMedicineFormFilter(value as MedicineFormEnum | 'all')}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      {Object.values(MedicineFormEnum).map(form => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading stock...</p>
                  </div>
                ) : filteredMedicines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No medicines found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredMedicines.map((medicine) => {
                      const batch = medicine.shipmentItems[0];
                      const isLowStock = batch && batch.quantity <= 10;
                      const expiringSoon = batch && isExpiringSoon(batch.expiryDate);
                      
                      return (
                        <div key={medicine.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{medicine.name}</h4>
                                <Badge variant="outline">{medicine.strength} {medicine.form}</Badge>
                                {isLowStock && (
                                  <Badge variant="warning">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Low Stock
                                  </Badge>
                                )}
                                {expiringSoon && (
                                  <Badge variant="destructive">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Manufacturer:</strong> {medicine.manufacturer} | 
                                <strong> Origin:</strong> {medicine.countryOfOrigin}
                              </p>
                              
                              {batch ? (
                                <div className="text-sm text-muted-foreground">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><strong>Batch:</strong> {batch.batchNumber}</div>
                                    <div><strong>Available:</strong> {batch.quantity} units</div>
                                    <div><strong>Unit Price:</strong> {formatCurrency(batch.unitCost)}</div>
                                    <div><strong>Expires:</strong> {formatDate(batch.expiryDate)}</div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-destructive">No stock available</p>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => addToCart(medicine)}
                              disabled={!batch || batch.quantity <= 0}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Cart */}
        <div className="space-y-4">
          {/* Distributor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search distributors..."
                        value={distributorSearchTerm}
                        onChange={(e) => setDistributorSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select 
                    value={distributorTypeFilter} 
                    onValueChange={(value: string) => setDistributorTypeFilter(value as DistributorType | 'all')}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.values(DistributorType).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="distributor">Select Distributor</Label>
                  <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose distributor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDistributors.length === 0 ? (
                        <div className="text-center py-2 text-muted-foreground">
                          No distributors found
                        </div>
                      ) : (
                        filteredDistributors.map((distributor) => (
                          <SelectItem key={distributor.id} value={distributor.id}>
                            <div>
                              <div className="font-medium">{distributor.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {distributor.code} - {distributor.type}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Select 
                  value={currency} 
                  onValueChange={(value: 'NGN' | 'USD') => setCurrency(value)} 
                  disabled={!!selectedDistributor}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedDistributor && (
                <div className="text-sm text-muted-foreground">
                  <div className="p-3 bg-muted rounded">
                    {distributors.find(d => d.id === selectedDistributor) ? (
                      <div>
                        <div><strong>Contact:</strong> {distributors.find(d => d.id === selectedDistributor)?.phone}</div>
                        <div><strong>Email:</strong> {distributors.find(d => d.id === selectedDistributor)?.email}</div>
                        <div><strong>Credit Limit:</strong> {formatCurrency(distributors.find(d => d.id === selectedDistributor)?.creditLimit || 0)}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={`${item.medicineId}-${item.batchNumber}`} className="border rounded p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{item.medicine.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {item.medicine.strength} {item.medicine.form}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Batch: {item.batchNumber}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.medicineId, item.batchNumber)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.medicineId, item.batchNumber, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.medicineId, item.batchNumber, parseInt(e.target.value)  )}
                              className="text-center h-8"
                              min="1"
                              max={item.availableStock}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.medicineId, item.batchNumber, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateUnitPrice(item.medicineId, item.batchNumber, parseFloat(e.target.value) )}
                            className="h-8"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        <div>Available: {item.availableStock} units</div>
                        <div className="font-medium text-foreground">
                          Subtotal: {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold">{formatCurrency(getTotalAmount())}</span>
                  </div>
                  
                  <Button
                    onClick={createOrder}
                    disabled={createSalesOrderMutation.isPending || !selectedDistributor || cart.length === 0}
                    className="w-full"
                  >
                    {createSalesOrderMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Order
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}