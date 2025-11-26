/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck,  Package, Download, Search, Edit, Archive, AlertTriangle, RotateCcw, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { KPICard } from '@/components/shared/kpi-card';
import { BarcodeScanner } from '@/components/shared/barcode-scanner';
import { useWarehouseMetrics } from '@/hooks/use-metrics';
import { useStockManagement } from '@/hooks/use-stocks-management';
import { useManufacturers } from '@/hooks/use-manufacturer';
import { useShipmentManagement } from '@/hooks/use-shipment-management';
import { InventoryItem } from '@/types/inventory';
import { MedicineFormEnum, ShipmentItem, ShipmentMode } from '@/app/api/service/shipmentService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AddShipmentDialog from '../shipments/components/add-shipment-dialog';
import { AlertCard } from '@/components/shared/alert-card';
import { Input } from '@/components/ui/input';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [formFilter, setFormFilter] = useState<MedicineFormEnum | 'all'>('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // ───── Add Shipment Dialog State (exact same as ShipmentReceiving page) ─────
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    proformaInvoiceNo: '',
    billOfLading: '',
    supplier: '',
    receivedDate: new Date().toISOString().split('T')[0],
    shipmentMode: 'AIR' as ShipmentMode,
  });

  const [newShipmentItems, setNewShipmentItems] = useState<ShipmentItem[]>([]);

  const [invoiceDoc, setInvoiceDoc] = useState<Array<{ url: string; fileName: string }>>([]);
  const [qualityCheck, setQualityCheck] = useState<Array<{ url: string; fileName: string }>>([]);
  const [packingList, setPackingList] = useState<Array<{ url: string; fileName: string }>>([]);
  const [insurance, setInsurance] = useState<Array<{ url: string; fileName: string }>>([]);

  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [manufacturerPage, setManufacturerPage] = useState(1);
  const manufacturerLimit = 20;

  // ───── Fetch Manufacturers (with search debounce) ─────
  const { data: manufacturerResponse, isLoading: isManufacturersLoading } = useManufacturers({
    search: manufacturerSearch,
    page: manufacturerPage,
    limit: manufacturerLimit,
    sortField: 'name',
    sortOrder: 'asc',
  });

  const manufacturers = manufacturerResponse?.data || [];
  const manufacturerMeta = manufacturerResponse?.meta || {
    page: 1, limit: 20, itemCount: 0, pageCount: 0,
    hasPreviousPage: false, hasNextPage: false
  };

  // Debounce manufacturer search
  useEffect(() => {
    const timer = setTimeout(() => {
      setManufacturerPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [manufacturerSearch]);

  // ───── Shipment Creation Mutation ─────
  const { createMutation, isCreating } = useShipmentManagement();

  // ───── Data Hooks ─────
  const {
    overview,
    recentMovements,
    fifoQueue,
    expiringBatches,
    isLoadingOverview,
    isLoadingMovements,
    isLoadingFifo,
    isLoadingExpiring,
    errorOverview,
    errorMovements,
    errorFifo,
    errorExpiring,
  } = useWarehouseMetrics();

  const queryParams = {
    search: searchTerm,
    form: formFilter !== 'all' ? formFilter : undefined,
    inStockOnly: stockFilter === 'in-stock' ? true : stockFilter === 'out-of-stock' ? false : undefined,
    expiryBefore: expiryFilter === 'expiring-soon'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : expiryFilter === 'expired' ? new Date().toISOString() : undefined,
    sortField: 'name',
    sortOrder: 'asc' as const,
    page: currentPage,
    limit: 10,
  };

  const { inventory, isLoadingInventory, inventoryError } = useStockManagement(queryParams);
  const filteredInventory = inventory?.data || [];

  // ───── Helpers ─────
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB');
  const formatTimeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours < 1 ? 'just now' : `${hours}h ago`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  type BadgeVariant = 'destructive' | 'default' | 'secondary' | 'outline' | 'warning' | null | undefined;
  const getPriority = (days: number): { label: string; variant: BadgeVariant } => {
    if (days < 30) return { label: 'URGENT', variant: 'destructive' };
    if (days < 90) return { label: 'HIGH', variant: 'default' };
    if (days < 180) return { label: 'MEDIUM', variant: 'secondary' };
    return { label: 'LOW', variant: 'default' };
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return <Badge className="bg-red-500 text-white">Out of Stock</Badge>;
    if (quantity <= 50) return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    if (quantity <= 100) return <Badge className="bg-blue-500 text-white">Medium Stock</Badge>;
    return <Badge className="bg-green-500 text-white">In Stock</Badge>;
  };

  const getTotalQuantity = (item: InventoryItem) =>
    item.shipmentItems.reduce((sum, b) => sum + b.quantity, 0);

  // ───── Handlers ─────
  const handleBarcodeScan = (barcode: string) => {
    const medicine = filteredInventory.find(i => i.id === barcode || i.name.toLowerCase().includes(barcode.toLowerCase()));
    if (medicine) toast.success(`Found: ${medicine.name}`);
    else toast.error('Medicine not found');
    setIsScannerOpen(false);
  };

  const handleFormFilterChange = (value: string) => {
    if (value === 'all' || Object.values(MedicineFormEnum).includes(value as MedicineFormEnum)) {
      setFormFilter(value as MedicineFormEnum | 'all');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRecordShipment = async () => {
    // Validation will be done inside AddShipmentDialog, but we keep mutation here
    try {
      await createMutation.mutateAsync({
        proformaInvoiceNo: formData.proformaInvoiceNo,
        billOfLading: formData.billOfLading,
        supplier: formData.supplier,
        receivedDate: formData.receivedDate,
        shipmentMode: formData.shipmentMode,
        documents: [
          ...(invoiceDoc[0] ? [{ invoiceDoc: invoiceDoc[0].url, invoiceDocName: invoiceDoc[0].fileName }] : []),
          ...(qualityCheck[0] ? [{ qualityCheck: qualityCheck[0].url, qualityCheckName: qualityCheck[0].fileName }] : []),
          ...(packingList[0] ? [{ packingList: packingList[0].url, packingListName: packingList[0].fileName }] : []),
          ...(insurance[0] ? [{ insurance: insurance[0].url, insuranceName: insurance[0].fileName }] : []),
        ],
        items: newShipmentItems.map(item => ({
          medicine: {
            ...item.medicine,
            quantity: Number(item.medicine.quantity),
            unitCost: Number(item.medicine.unitCost),
            unitCostToBeSold: Number(item.medicine.unitCostToBeSold),
            packSize: Number(item.medicine.packSize || 0),
            batchNumber: item.medicine.batchNumber ?? '',
            expiryDate: item.medicine.expiryDate ?? new Date().toISOString(),
          }
        })),
      });

      toast.success('Shipment recorded successfully!');
      setIsAddDialogOpen(false);
      // Reset form
      setFormData({
        proformaInvoiceNo: '',
        billOfLading: '',
        supplier: '',
        receivedDate: new Date().toISOString().split('T')[0],
        shipmentMode: 'AIR',
      });
      setNewShipmentItems([]);
      setInvoiceDoc([]); setQualityCheck([]); setPackingList([]); setInsurance([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to record shipment');
    }
  };

  // Handler to open/edit a specific batch; replace with real navigation/modal logic as needed
  const editBatch = (batchId?: string, item?: InventoryItem) => {
    if (!batchId) {
      toast.error('No batch selected to edit');
      return;
    }
    // TODO: Replace with actual edit dialog/navigation
    toast.success(`Edit batch ${batchId} for ${item?.name ?? 'item'}`);
  };
 
    

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Package className="h-6 w-6" />
            Warehouse Inventory
          </h1>
          <p className="text-muted-foreground">Naxos Pharmaceuticals – Real-time Stock</p>
        </div>

        <div className="flex gap-2">
          {/* FULL POWERFUL ADD SHIPMENT DIALOG */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Truck className="h-4 w-4 mr-2" />
                Receive Shipment
              </Button>
            </DialogTrigger>

            <AddShipmentDialog
              isAddDialogOpen={isAddDialogOpen}
              setIsAddDialogOpen={setIsAddDialogOpen}
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              newShipmentItems={newShipmentItems}
              setNewShipmentItems={setNewShipmentItems}
              invoiceDoc={invoiceDoc}
              setInvoiceDoc={setInvoiceDoc}
              qualityCheck={qualityCheck}
              setQualityCheck={setQualityCheck}
              packingList={packingList}
              setPackingList={setPackingList}
              insurance={insurance}
              setInsurance={setInsurance}
              manufacturers={manufacturers}
              isManufacturersLoading={isManufacturersLoading}
              manufacturerSearch={manufacturerSearch}
              setManufacturerSearch={setManufacturerSearch}
              manufacturerMeta={manufacturerMeta}
              setManufacturerPage={setManufacturerPage}
              handleRecordShipment={handleRecordShipment}
              isCreating={isCreating}
            />
          </Dialog>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards, Alerts, Tabs — all unchanged */}
      {/* ... (your existing KPI, Alerts, and Tabs content remains 100% the same) ... */}

      {/* Example: Keep your KPI section */}
      {isLoadingOverview ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard title="Active Items" value={overview?.activeItems?.toString() ?? '0'} subtitle="SKUs in system" status="info" />
          <KPICard title="Low Stock" value={overview?.lowStockItems?.toString() ?? '0'} subtitle="Below threshold" status="warning" />
          <KPICard title="Expiring Soon" value={overview?.expiringSoon?.toString() ?? '0'} subtitle="Next 90 days" status="danger" />
        </div>
      )}

      {/* Rest of your UI (Alerts, Tabs, etc.) remains exactly as before */}
      {/* ... Paste your original Alerts + TabsContent here ... */}
        {/* ───── Alerts ───── */}
            <div className="grid gap-4 md:grid-cols-2">
              <AlertCard
                type="low-stock"
                title="Critical Stock Levels"
                message={`${overview?.lowStockItems ?? 0} items need immediate reorder.`}
                priority="high"
                count={overview?.lowStockItems ?? 0}
                action={{ label: 'View Low Stock', onClick: () => setActiveTab('low-stock') }}
              />
              <AlertCard
                type="expiry"
                title="FIFO/FEFO Alert"
                message={`${expiringBatches.length} batches expiring soon.`}
                priority="medium"
                count={expiringBatches.length}
                action={{ label: 'View Expiring', onClick: () => setActiveTab('expiring') }}
              />
            </div>
      
            {/* ───── Tabs ───── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="expiring">Expiring</TabsTrigger>
              </TabsList>
      
              {/* ───── Overview ───── */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Recent Stock Movements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingMovements ? (
                        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                      ) : errorMovements ? (
                        <p className="text-red-500">{errorMovements.message}</p>
                      ) : recentMovements.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No recent movements</p>
                      ) : (
                        <div className="space-y-3">
                          {recentMovements.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-lg">
                                  <TrendingDown className="h-4 w-4 text-success rotate-180" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{m.medicine}</p>
                                  <p className="text-xs text-muted-foreground">Batch: {m.batchNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">+{m.quantity}</p>
                                <p className="text-xs text-muted-foreground">{formatTimeAgo(m.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
      
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RotateCcw className="h-5 w-5" />
                        FIFO/FEFO Queue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingFifo ? (
                        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                      ) : errorFifo ? (
                        <p className="text-red-500">{errorFifo.message}</p>
                      ) : fifoQueue.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">Queue empty</p>
                      ) : (
                        <div className="space-y-3">
                          {fifoQueue.slice(0, 5).map((b, i) => {
                            const daysLeft = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const prio = getPriority(daysLeft);
                            return (
                              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{b.medicine.name}</p>
                                  <p className="text-xs text-muted-foreground">Batch: {b.batchNumber}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={prio.variant}>{prio.label}</Badge>
                                    <span className="text-xs text-muted-foreground">{daysLeft} days</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">{b.quantity} units</p>
                                  <Button size="sm" variant="outline" className="mt-1">
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Prioritize
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
      
              {/* ───── All Items ───── */}
              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Inventory Items</CardTitle>
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search by name, manufacturer, strength, or form..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={formFilter} onValueChange={handleFormFilterChange}>
                        <SelectTrigger className="w-full lg:w-[150px]">
                          <SelectValue placeholder="Medicine Form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Forms</SelectItem>
                          {Object.values(MedicineFormEnum).map(form => (
                            <SelectItem key={form} value={form}>{form}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-full lg:w-[150px]">
                          <SelectValue placeholder="Stock Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stock</SelectItem>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="low-stock">Low Stock</SelectItem>
                          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                        <SelectTrigger className="w-full lg:w-[150px]">
                          <SelectValue placeholder="Expiry Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInventory ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    ) : inventoryError ? (
                      <p className="text-red-500">{inventoryError.message}</p>
                    ) : filteredInventory.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No inventory found</h3>
                        <p className="text-gray-500">
                          {searchTerm || formFilter !== 'all' || stockFilter !== 'all' || expiryFilter !== 'all'
                            ? 'Try adjusting your filters.'
                            : 'No items available.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medicine</TableHead>
                              <TableHead>Manufacturer</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Batches</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredInventory.map(item => {
                              const totalQuantity = getTotalQuantity(item);
                              const totalValue = item.shipmentItems.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
                              return (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">{item.strength} {item.form}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.manufacturer}</TableCell>
                                  <TableCell>
                                    {getStockStatus(totalQuantity)}
                                    <p className="text-sm mt-1">{totalQuantity} units</p>
                                  </TableCell>
                                  <TableCell>{item.shipmentItems.length} batch{item.shipmentItems.length !== 1 ? 'es' : ''}</TableCell>
                                  <TableCell>{formatCurrency(totalValue)}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editBatch(item.shipmentItems[0]?.id, item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        {inventory?.meta && (
                          <div className="flex justify-between items-center mt-4">
                            <Button
                              variant="outline"
                              disabled={!inventory.meta.hasPreviousPage}
                              onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                              Previous
                            </Button>
                            <span>Page {inventory.meta.page} of {inventory.meta.pageCount}</span>
                            <Button
                              variant="outline"
                              disabled={!inventory.meta.hasNextPage}
                              onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
      
              {/* ───── Low Stock ───── */}
              <TabsContent value="low-stock" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Low Stock Items</CardTitle>
                    <CardDescription>Items requiring immediate restocking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInventory ? (
                      <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : filteredInventory.filter(item => getTotalQuantity(item) <= 50).length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No low stock items</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Suggested Order</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInventory
                            .filter(item => getTotalQuantity(item) <= 50)
                            .map(item => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.strength} {item.form}</p>
                                  </div>
                                </TableCell>
                                <TableCell><Badge variant="destructive">{getTotalQuantity(item)}</Badge></TableCell>
                                <TableCell>{item.packSize * 3}</TableCell>
                                <TableCell><Badge variant="destructive">CRITICAL</Badge></TableCell>
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
      
              {/* ───── Expiring Batches ───── */}
              <TabsContent value="expiring" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Expiring Batches (FIFO/FEFO)
                    </CardTitle>
                    <CardDescription>Prioritize sales by expiry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingExpiring ? (
                      <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : errorExpiring ? (
                      <p className="text-red-500">{errorExpiring.message}</p>
                    ) : expiringBatches.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No expiring batches</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Days Left</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expiringBatches.map(b => {
                            const daysLeft = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const prio = getPriority(daysLeft);
                            return (
                              <TableRow key={b.id}>
                                <TableCell>{b.medicine.name}</TableCell>
                                <TableCell>{b.batchNumber}</TableCell>
                                <TableCell>{b.quantity}</TableCell>
                                <TableCell>{formatDate(b.expiryDate)}</TableCell>
                                <TableCell><Badge variant={daysLeft < 30 ? 'destructive' : 'warning'}>{daysLeft}</Badge></TableCell>
                                <TableCell><Badge variant={prio.variant}>{prio.label}</Badge></TableCell>
                                <TableCell>
                                  <Button size="sm" variant="outline">
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Prioritize
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
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