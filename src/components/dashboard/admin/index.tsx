'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockMedicines, mockOrders, mockSalesReports } from '@/data';
import { 
  Users,  
  Clock,
  TrendingUp,
  Download,
  Eye,
  FileText
} from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { AlertCard } from '@/components/shared/alert-card';

export default function Overview() {
  const lowStockCount = mockMedicines.filter(m => m.stock <= m.minThreshold).length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const todaysSales = mockSalesReports[0]?.totalSales || 0;
  const todaysOrders = mockSalesReports[0]?.totalOrders || 0;

  // Calculate expiring stock values (mock data)
  const expiringIn30Days = 89500;
  const expiringIn90Days = 156000;
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

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stock Value"
          value="₦2,450,000"
          subtitle="Current inventory worth"
          trend={{ value: 12, direction: 'up', period: 'last month' }}
          status="success"
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
        />
        <KPICard
          title="Account Recieveable Balance"
          value={`₦${arBalance.toLocaleString()}`}
          subtitle="Outstanding receivables"
          trend={{ value: 8, direction: 'up', period: 'last month' }}
          status="info"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Expiring Stock (90 days)"
          value={`₦${expiringIn90Days.toLocaleString()}`}
          subtitle="Medium-term expiry risk"
          status="info"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          subtitle="Below safety stock"
          status="warning"
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
            message={`${expiringIn30Days.toLocaleString()} worth of stock will expire within 30 days. Review and plan clearance sales.`}
            priority="high"
            count={8}
            action={{
              label: "View Expiring Stock",
              onClick: () => console.log("View expiring stock")
            }}
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
          />
        </div>
      </div>

      {/* Recent Orders and Quick Actions */}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download NAFDAC Audit Packet
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Staff Permissions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Review Pending Approvals
            </Button>
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