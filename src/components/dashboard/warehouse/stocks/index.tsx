/* eslint-disable @typescript-eslint/no-unused-vars */"use client";
import { JSX, useState } from 'react';
import { useStockManagement } from '@/hooks/use-stocks-management';
import { InventoryItem } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  Factory,
  MapPin,
  RefreshCw,
  TrendingDown,
  Clock,
  Truck,
  Eye
} from 'lucide-react';
import { MedicineFormEnum } from '@/app/api/service/shipmentService';
import { useWarehouseMetrics } from '@/hooks/use-metrics';

export default function StocksManagementWarehouse() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState<MedicineFormEnum | 'all'>('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const queryParams = {
    search: searchTerm,
    form: formFilter !== 'all' ? formFilter : undefined,
    inStockOnly: stockFilter === 'in-stock' ? true : stockFilter === 'out-of-stock' ? false : undefined,
    expiryBefore: expiryFilter === 'expiring-soon' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : expiryFilter === 'expired' ? new Date().toISOString() : undefined,
    sortField,
    sortOrder,
    page: currentPage,
    limit: 10,
  };

  // Inventory + expiring batches
  const { 
    inventory, 
    isLoadingInventory, 
    inventoryError, 
    expiringBatches, 
    isLoadingExpiringBatches, 
    expiringBatchesError 
  } = useStockManagement(queryParams);

  // Overview metrics (real API)
  const { 
    overview: overview, 
    isLoadingOverview: isLoadingOverview, 
    errorOverview: overviewError 
  } = useWarehouseMetrics();

  const filteredInventory = inventory?.data || [];

  const getTotalQuantity = (item: InventoryItem): number => {
    return item.shipmentItems.reduce((sum, batch) => sum + batch.quantity, 0);
  };

  const getTotalValue = (item: InventoryItem): number => {
    return item.shipmentItems.reduce((sum, batch) => sum + (batch.quantity * batch.unitCost), 0);
  };

  const getStockStatus = (quantity: number): JSX.Element => {
    if (quantity === 0) return <Badge className="bg-red-500 text-white">Out of Stock</Badge>;
    if (quantity <= 50) return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    if (quantity <= 100) return <Badge className="bg-blue-500 text-white">Medium Stock</Badge>;
    return <Badge className="bg-green-500 text-white">In Stock</Badge>;
  };

  const getExpiryStatus = (expiryDate: string): JSX.Element => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <Badge className="bg-red-500 text-white">Expired</Badge>;
    if (diffDays <= 30) return <Badge className="bg-yellow-500 text-white">Expiring Soon</Badge>;
    if (diffDays <= 90) return <Badge className="bg-blue-500 text-white">Expires in 3 months</Badge>;
    return <Badge className="bg-green-500 text-white">Good</Badge>;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const handleFormFilterChange = (value: string): void => {
    if (value === 'all' || Object.values(MedicineFormEnum).includes(value as MedicineFormEnum)) {
      setFormFilter(value as MedicineFormEnum | 'all');
    }
  };

  const toggleItemDetails = (itemId: string): void => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const handleRefresh = (): void => {
    setSearchTerm('');
    setFormFilter('all');
    setStockFilter('all');
    setExpiryFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-6 w-6" />
            Warehouse Stock
          </h1>
          <p className="text-gray-500">
            Monitor stock levels, expiry dates, and manage inventory
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-gray-300" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards — Only 3 KPIs */}
      {isLoadingOverview ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : overviewError ? (
        <Card className="border-red-500">
          <CardContent className="p-4 text-red-500">
            Error loading overview: {(overviewError as Error).message}
          </CardContent>
        </Card>
      ) : overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Active Items</p>
                  <p className="text-2xl font-bold">{overview.activeItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-yellow-500">{overview.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-500">{overview.expiringSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expiring Items Alert */}
      {isLoadingExpiringBatches ? (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-3 bg-white rounded border">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : expiringBatchesError ? (
        <Card className="border-red-500">
          <CardContent className="p-4 text-red-500">
            Error loading expiring batches: {expiringBatchesError.message}
          </CardContent>
        </Card>
      ) : expiringBatches && expiringBatches.length > 0 ? (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Expiring Items Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <div className="font-medium">{batch.medicine.name}</div>
                    <div className="text-sm text-gray-500">
                      Batch: {batch.batchNumber} | Quantity: {batch.quantity} units
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-500 font-medium">
                      Expires: {formatDate(batch.expiryDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Value: {formatCurrency(batch.quantity * batch.unitCost)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, manufacturer, strength, or form..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {Object.values(MedicineFormEnum).map((form) => (
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
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent>
          {isLoadingInventory ? (
            <div className="space-y-4 py-8">
              <div className="grid grid-cols-6 gap-4 px-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3">
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : inventoryError ? (
            <div className="text-center py-8 text-red-500">
              Error loading inventory: {inventoryError.message}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No inventory found</h3>
              <p className="text-gray-500">
                {searchTerm || formFilter !== 'all' || stockFilter !== 'all' || expiryFilter !== 'all'
                  ? 'Try adjusting your filters to see more items.'
                  : 'No inventory items available.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Details</TableHead>
                    <TableHead>Manufacturer & Origin</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Batch Information</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item: InventoryItem) => {
                    const totalQuantity = getTotalQuantity(item);
                    const totalValue = getTotalValue(item);
                    const isExpanded = expandedItem === item.id;
                    
                    return (
                      <>
                        <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                {item.strength} {item.form}
                              </div>
                              <div className="text-xs text-gray-500">
                                Pack Size: {item.packSize} units
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1 text-sm">
                                <Factory className="h-3 w-3" />
                                {item.manufacturer}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {item.countryOfOrigin}
                              </div>
                              <div className="text-xs text-gray-500">
                                Mfg: {formatDate(item.manufacturingDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {getStockStatus(totalQuantity)}
                              <div className="text-sm font-medium mt-1">
                                {totalQuantity} units
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.shipmentItems.length} batch{item.shipmentItems.length !== 1 ? 'es' : ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {item.shipmentItems.slice(0, 2).map((batch, index) => (
                                <div key={index} className="text-xs">
                                  <div className="font-medium">{batch.batchNumber}</div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(batch.expiryDate)}
                                  </div>
                                  {getExpiryStatus(batch.expiryDate)}
                                </div>
                              ))}
                              {item.shipmentItems.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{item.shipmentItems.length - 2} more batches
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(totalValue)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Avg: {formatCurrency(totalValue / totalQuantity || 0)}/unit
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleItemDetails(item.id)}
                              className="border-gray-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-100">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3">Batch Details for {item.name}</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {item.shipmentItems.map((batch, index) => (
                                    <div key={index} className="border rounded p-3 bg-white">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Truck className="h-4 w-4 text-blue-600" />
                                          <span className="font-medium">{batch.batchNumber}</span>
                                          {getExpiryStatus(batch.expiryDate)}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="text-gray-500">Quantity:</span>
                                          <div className="font-medium">{batch.quantity} units</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Expiry Date:</span>
                                          <div className="font-medium">{formatDate(batch.expiryDate)}</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Unit Cost:</span>
                                          <div className="font-medium">{formatCurrency(batch.unitCost)}</div>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Batch Value:</span>
                                          <div className="font-medium">{formatCurrency(batch.quantity * batch.unitCost)}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Total Quantity:</span>
                                      <div className="font-bold">{totalQuantity} units</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Total Batches:</span>
                                      <div className="font-bold">{item.shipmentItems.length}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Total Value:</span>
                                      <div className="font-bold">{formatCurrency(totalValue)}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Avg Cost/Unit:</span>
                                      <div className="font-bold">{formatCurrency(totalValue / totalQuantity || 0)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
    </div>
  );
}