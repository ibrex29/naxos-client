'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Eye, AlertCircle } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { AlertCard } from '@/components/shared/alert-card';
import {  useWarehouseMetrics } from '@/hooks/use-metrics';
import { mockOrders, mockSalesReports, mockMedicines } from '@/data';

export default function Overview() {
  // Fetch real inventory overview
  const { overview: inventoryOverview, isLoadingOverview : isLoading, errorOverview: error } = useWarehouseMetrics();

  // Mock data (unchanged)
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const todaysSales = mockSalesReports[0]?.totalSales || 0;
  const todaysOrders = mockSalesReports[0]?.totalOrders || 0;
  const arBalance = 340000;

  const recentOrders = [
    { id: 'NX-001', customer: 'MedPlus Pharmacy', amount: '₦45,000', status: 'Pending', date: 'Jan 15, 2024' },
    { id: 'NX-002', customer: 'HealthCare Ltd', amount: '₦78,500', status: 'Confirmed', date: 'Jan 15, 2024' },
    { id: 'NX-003', customer: 'City Pharmacy', amount: '₦32,000', status: 'Shipped', date: 'Jan 14, 2024' },
    { id: 'NX-004', customer: 'WellPoint Medical', amount: '₦156,000', status: 'Delivered', date: 'Jan 14, 2024' },
  ];

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Confirmed': return 'outline';
      default: return 'destructive';
    }
  };

  // Use real data if available, fallback to mock
  const totalStockValue = inventoryOverview?.totalStockValue ?? 2450000;
  const lowStockCount = inventoryOverview?.lowStockItems ?? mockMedicines.filter(m => m.stock <= m.minThreshold).length;
  const expiringIn30Days = inventoryOverview?.expiringSoon ?? 89500;
  const activeItemsCount = inventoryOverview?.activeItems ?? mockMedicines.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Naxos Pharmaceuticals</h1>
            <p className="text-muted-foreground">Admin Dashboard Overview</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to load inventory metrics. Using fallback data.
          </p>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stock Value"
          value={`₦${totalStockValue.toLocaleString()}`}
          subtitle="Current inventory worth"
          trend={{ value: 12, direction: 'up', period: 'last month' }}
          status="success"
          loading={isLoading}
        />
        <KPICard
          title="Outstanding Orders"
          value={pendingOrders.toString()}
          subtitle="Pending processing"
          trend={{ value: -5, direction: 'down', period: 'last week' }}
          status="info"
        />
        <KPICard
          title="Expiring Stock (30 days)"
          value={`₦${expiringIn30Days.toLocaleString()}`}
          subtitle="Items expiring soon"
          status="warning"
          loading={isLoading}
        />
        <KPICard
          title="Account Receivable Balance"
          value={`₦${arBalance.toLocaleString()}`}
          subtitle="Outstanding receivables"
          trend={{ value: 8, direction: 'up', period: 'last month' }}
          status="info"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Active Items"
          value={activeItemsCount.toString()}
          subtitle="Total medicines in stock"
          status="info"
          loading={isLoading}
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          subtitle="Below safety stock"
          status="warning"
          loading={isLoading}
        />
        <KPICard
          title="Today's Sales"
          value={`₦${todaysSales.toLocaleString()}`}
          subtitle={`${todaysOrders} orders today`}
          trend={{ value: 18, direction: 'up', period: 'yesterday' }}
          status="success"
        />
      </div>

      {/* Alerts Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Priority Alerts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AlertCard
            type="expiry"
            title="Stock Expiring Soon"
            message={`₦${expiringIn30Days.toLocaleString()} worth of stock will expire within 30 days. Review and plan clearance sales.`}
            priority="high"
            count={inventoryOverview?.expiringSoon ? 8 : undefined}
            action={{
              label: "View Expiring Stock",
              onClick: () => console.log("View expiring stock")
            }}
            loading={isLoading}
          />
          <AlertCard
            type="low-stock"
            title="Low Stock Alert"
            message={`${lowStockCount} medicines are below safety stock levels. Reorder required to prevent stockouts.`}
            priority="medium"
            count={lowStockCount}
            action={{
              label: "View Low Stock",
              onClick: () => console.log("View low stock")
            }}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{order.id}</p>
                      <Badge variant={getStatusVariant(order.status)} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stock Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockMedicines.slice(0, 6).map((medicine) => {
              const stockPercentage = (medicine.stock / (medicine.minThreshold * 3)) * 100;
              const isLow = medicine.stock <= medicine.minThreshold;
              
              return (
                <div key={medicine.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{medicine.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medicine.stock} units
                      </p>
                    </div>
                    <Badge variant={isLow ? 'destructive' : 'default'} className="text-xs">
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min(stockPercentage, 100)} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}