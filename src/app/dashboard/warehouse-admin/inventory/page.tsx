/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockMedicines } from '@/data/mockData';
import { 
  Search, 

  Plus,
  
  Scan,
  Truck,
  CheckCircle,

  TrendingDown,
  Archive,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { KPICard } from '@/components/shared/kpi-card';
import { AlertCard } from '@/components/shared/alert-card';
import { BarcodeScanner } from '@/components/shared/barcode-scanner';

interface Shipment {
  id: string;
  proformaInvoice: string;
  billOfLading: string;
  status: 'pending' | 'received' | 'processed';
  createdAt: Date;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    batchNumber: string;
    expiryDate: string;
    costPrice: number;
  }>;
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isReceivingOpen, setIsReceivingOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // Receiving form state
  const [proformaInvoice, setProformaInvoice] = useState('');
  const [billOfLading, setBillOfLading] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [costPrice, setCostPrice] = useState('');

  const filteredMedicines = mockMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMedicines = mockMedicines.filter(m => m.stock <= m.minThreshold);
  const expiringBatches = mockMedicines.flatMap(medicine =>
    medicine.batches
      .filter(batch => {
        const expiryDate = new Date(batch.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow;
      })
      .map(batch => ({ ...batch, medicineName: medicine.name, medicineId: medicine.id }))
  );



  const getStockStatus = (current: number, threshold: number): { label: string; variant: 'destructive' | 'default' | 'warning' } => {
    if (current === 0) return { label: 'Out of Stock', variant: 'destructive' };
    if (current <= threshold) return { label: 'Low Stock', variant: 'destructive' };
    if (current <= threshold * 1.5) return { label: 'Medium Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'default' };
  };

 const getBatchPriority = (expiryDate: string): { priority: string; variant: 'destructive' | 'default' | 'secondary' | 'warning' | null | undefined } => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 30) return { priority: 'URGENT', variant: 'destructive' };
  if (daysLeft < 90) return { priority: 'HIGH', variant: 'default' };
  if (daysLeft < 180) return { priority: 'MEDIUM', variant: 'secondary' };
  return { priority: 'LOW', variant: 'default' };
 };
  
  const handleReceiveShipment = () => {
    if (!proformaInvoice || !billOfLading) {
      toast.error('Please provide both Proforma Invoice and Bill of Lading');
      return;
    }

    const newShipment: Shipment = {
      id: `SHP-${Date.now()}`,
      proformaInvoice,
      billOfLading,
      status: 'received',
      createdAt: new Date(),
      items: []
    };

    setShipments([...shipments, newShipment]);
    setProformaInvoice('');
    setBillOfLading('');
    setIsReceivingOpen(false);
    toast.success('Shipment received successfully');
  };

  const handleBarcodeScan = (barcode: string) => {
    const medicine = mockMedicines.find(m => m.id === barcode);
    if (medicine) {
      setSelectedMedicine(medicine.id);
      toast.success(`Scanned: ${medicine.name}`);
    } else {
      toast.error('Medicine not found');
    }
  };

  const addBatchEntry = () => {
    if (!selectedMedicine || !quantity || !batchNumber || !expiryDate || !costPrice) {
      toast.error('Please fill all batch details');
      return;
    }

    const medicine = mockMedicines.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    toast.success(`Added batch ${batchNumber} for ${medicine.name}`);
    
    // Reset form
    setSelectedMedicine('');
    setQuantity('');
    setBatchNumber('');
    setExpiryDate('');
    setCostPrice('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Warehouse Inventory</h1>
            <p className="text-muted-foreground">Naxos Pharmaceuticals - Stock Management</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isReceivingOpen} onOpenChange={setIsReceivingOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Truck className="h-4 w-4 mr-2" />
                  Receive Shipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Receive New Shipment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Proforma Invoice Number</Label>
                    <Input
                      value={proformaInvoice}
                      onChange={(e) => setProformaInvoice(e.target.value)}
                      placeholder="PI-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bill of Lading Number</Label>
                    <Input
                      value={billOfLading}
                      onChange={(e) => setBillOfLading(e.target.value)}
                      placeholder="BL-2024-001"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleReceiveShipment} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Receive Shipment
                    </Button>
                    <Button variant="outline" onClick={() => setIsReceivingOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          <KPICard
            title="Low Stock Items"
            value={lowStockMedicines.length.toString()}
            subtitle="Below safety threshold"
            status="warning"
          />
          <KPICard
            title="Expiring Soon"
            value={expiringBatches.length.toString()}
            subtitle="Next 90 days"
            status="danger"
          />
          <KPICard
            title="Active Items"
            value={mockMedicines.length.toString()}
            subtitle="Total SKUs in system"
            status="info"
          />
        </div>

        {/* Priority Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <AlertCard
            type="low-stock"
            title="Critical Stock Levels"
            message={`${lowStockMedicines.length} items are below safety stock. Immediate reordering required.`}
            priority="high"
            count={lowStockMedicines.length}
            action={{
              label: "View Low Stock Items",
              onClick: () => setActiveTab('low-stock')
            }}
          />
          <AlertCard
            type="expiry"
            title="FIFO/FEFO Alert"
            message={`${expiringBatches.length} batches expiring soon. Review sales prioritization.`}
            priority="medium"
            count={expiringBatches.length}
            action={{
              label: "View Expiring Batches",
              onClick: () => setActiveTab('expiring')
            }}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="receiving">Receiving</TabsTrigger>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'inward', item: 'Paracetamol 500mg', quantity: 500, time: '2 hours ago' },
                    { type: 'outward', item: 'Amoxicillin 250mg', quantity: 120, time: '4 hours ago' },
                    { type: 'inward', item: 'Ibuprofen 400mg', quantity: 200, time: '6 hours ago' }
                  ].map((movement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {movement.type === 'inward' ? (
                          <div className="p-2 bg-success/10 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-success rotate-180" />
                          </div>
                        ) : (
                          <div className="p-2 bg-info/10 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-info" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{movement.item}</p>
                          <p className="text-xs text-muted-foreground">{movement.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {movement.type === 'inward' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{movement.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">FIFO/FEFO Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringBatches.slice(0, 5).map((batch, index) => {
                    const priority = getBatchPriority(batch.expiryDate);
                    const daysLeft = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={`${batch.medicineId}-${batch.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{batch.medicineName}</p>
                          <p className="text-xs text-muted-foreground">Batch: {batch.batchNumber}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={priority.variant} className="text-xs">
                              {priority.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{daysLeft} days left</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{batch.quantity} units</p>
                          <Button size="sm" variant="outline" className="mt-1">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Prioritize
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receiving" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch & Expiry Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label>Select Medicine</Label>
                    <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMedicines.map((medicine) => (
                          <SelectItem key={medicine.id} value={medicine.id}>
                            {medicine.name} - {medicine.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-7">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsScannerOpen(true)}
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="100"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Cost Price (₦)</Label>
                    <Input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="50.00"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch Number</Label>
                    <Input
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="BTH-2024-001"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={addBatchEntry} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Batch Entry
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                {shipments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No shipments received</p>
                    <p className="text-xs">Recent shipments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shipments.map((shipment) => (
                      <div key={shipment.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{shipment.id}</p>
                            <p className="text-xs text-muted-foreground">PI: {shipment.proformaInvoice}</p>
                            <p className="text-xs text-muted-foreground">BL: {shipment.billOfLading}</p>
                          </div>
                          <Badge variant="default" className="text-xs">
                            {shipment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {shipment.createdAt.toLocaleDateString()} at {shipment.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Inventory Items</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Min Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map((medicine) => {
                      const status = getStockStatus(medicine.stock, medicine.minThreshold);
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medicine.name}</p>
                              <p className="text-sm text-muted-foreground">{medicine.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{medicine.type}</TableCell>
                          <TableCell>{medicine.stock}</TableCell>
                          <TableCell>{medicine.minThreshold}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>₦{(medicine.purchasePrice || 0).toFixed(2)}</TableCell>
                          <TableCell>₦{medicine.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Plus className="h-4 w-4 mr-1" />
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Low Stock Items</CardTitle>
              <CardDescription>Items requiring immediate restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Threshold</TableHead>
                      <TableHead>Suggested Order</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockMedicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">{medicine.brand}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{medicine.stock}</Badge>
                        </TableCell>
                        <TableCell>{medicine.minThreshold}</TableCell>
                        <TableCell>{medicine.minThreshold * 3}</TableCell>
                        <TableCell>
                          <Badge variant={medicine.stock === 0 ? 'destructive' : 'warning'}>
                            {medicine.stock === 0 ? 'CRITICAL' : 'HIGH'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm">
                            <Archive className="h-4 w-4 mr-1" />
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expiring Batches (FIFO/FEFO Management)</CardTitle>
              <CardDescription>Prioritize sales based on expiry dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringBatches.map((batch) => {
                      const daysLeft = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const priority = getBatchPriority(batch.expiryDate);
                      
                      return (
                        <TableRow key={`${batch.medicineId}-${batch.id}`}>
                          <TableCell>{batch.medicineName}</TableCell>
                          <TableCell>{batch.batchNumber}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={daysLeft < 30 ? 'destructive' : daysLeft < 90 ? 'warning' : 'secondary'}>
                              {daysLeft} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={priority.variant} className="text-xs">
                              {priority.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Prioritize
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        title="Scan Medicine Barcode"
      />
    </div>
  );
}