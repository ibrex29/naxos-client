'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Pill,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { mockMedicines, mockOrders, mockStaff, mockAlerts } from "@/data/mockData";

const AdminDashboard = () => {
  const totalMedicines = mockMedicines.length;
  const lowStockCount = mockMedicines.filter((m) => m.currentStock <= m.minStockThreshold).length;
  const totalStaff = mockStaff.length;
  const activeStaff = mockStaff.filter((s) => s.status === "active").length;
  const todayOrders = mockOrders.filter((o) => o.createdAt.startsWith("2024")).length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const metrics = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      color: "success",
    },
    {
      title: "Medicines in Stock",
      value: totalMedicines,
      description: `${lowStockCount} need restocking`,
      icon: Pill,
      color: "primary",
    },
    {
      title: "Active Staff",
      value: `${activeStaff}/${totalStaff}`,
      description: "Staff members",
      icon: Users,
      color: "warning",
    },
    {
      title: "Orders Today",
      value: todayOrders,
      description: "New orders",
      icon: ShoppingCart,
      color: "success",
    },
  ];

  const recentAlerts = mockAlerts.slice(0, 5);
  const topMedicines = mockMedicines
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your pharmacy operations</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(({ title, value, description, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={`h-4 w-4 text-${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
              Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.medicineName}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "high"
                        ? "destructive"
                        : alert.severity === "medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Top Medicines by Stock
            </CardTitle>
            <CardDescription>Current inventory levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMedicines.map((medicine) => (
                <div key={medicine.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{medicine.name}</span>
                    <span className="text-muted-foreground">
                      {medicine.currentStock} units
                    </span>
                  </div>
                  <Progress
                    value={(medicine.currentStock / (medicine.minStockThreshold * 5)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;