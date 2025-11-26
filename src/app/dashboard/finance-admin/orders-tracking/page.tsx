// app/orders/page.tsx  or  components/OrdersTracking.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Eye,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  customerType: 'hospital' | 'pharmacy' | 'clinic' | 'ngo' | 'wholesaler';
  amount: number;
  currency: 'NGN' | 'USD';
  paymentStatus: 'paid' | 'pending' | 'partial' | 'overdue';
  paymentType: 'cash' | 'credit';
  paymentMode: string;
  orderDate: string;
  dueDate: string | null;
  items: number;
  salesperson: string;
}

export default function OrdersTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Mock Data
  const orders: Order[] = [
    {
      id: 'ORD-2024-1250',
      customer: 'Lagos University Teaching Hospital',
      customerType: 'hospital',
      amount: 2_450_000,
      currency: 'NGN',
      paymentStatus: 'paid',
      paymentType: 'credit',
      paymentMode: 'transfer',
      orderDate: '2024-09-20',
      dueDate: '2024-10-20',
      items: 15,
      salesperson: 'Chioma Ugwu',
    },
    {
      id: 'ORD-2024-1249',
      customer: 'Premier Medical Pharmacy',
      customerType: 'pharmacy',
      amount: 850_000,
      currency: 'NGN',
      paymentStatus: 'pending',
      paymentType: 'credit',
      paymentMode: 'transfer',
      orderDate: '2024-09-19',
      dueDate: '2024-10-19',
      items: 8,
      salesperson: 'Chioma Ugwu',
    },
    {
      id: 'ORD-2024-1248',
      customer: 'City General Hospital',
      customerType: 'hospital',
      amount: 1_750_000,
      currency: 'NGN',
      paymentStatus: 'paid',
      paymentType: 'cash',
      paymentMode: 'cash',
      orderDate: '2024-09-19',
      dueDate: null,
      items: 12,
      salesperson: 'Chioma Ugwu',
    },
    {
      id: 'ORD-2024-1247',
      customer: 'Medical Aid International',
      customerType: 'ngo',
      amount: 3_200_000,
      currency: 'NGN',
      paymentStatus: 'overdue',
      paymentType: 'credit',
      paymentMode: 'transfer',
      orderDate: '2024-09-15',
      dueDate: '2024-09-15',
      items: 25,
      salesperson: 'Chioma Ugwu',
    },
    {
      id: 'ORD-2024-1246',
      customer: 'Abuja Clinic Network',
      customerType: 'clinic',
      amount: 920_000,
      currency: 'NGN',
      paymentStatus: 'paid',
      paymentType: 'cash',
      paymentMode: 'card',
      orderDate: '2024-09-18',
      dueDate: null,
      items: 6,
      salesperson: 'Chioma Ugwu',
    },
    {
      id: 'ORD-2024-1245',
      customer: 'Rural Health Centers',
      customerType: 'clinic',
      amount: 1_150_000,
      currency: 'NGN',
      paymentStatus: 'partial',
      paymentType: 'credit',
      paymentMode: 'transfer',
      orderDate: '2024-09-10',
      dueDate: '2024-10-10',
      items: 18,
      salesperson: 'Chioma Ugwu',
    },
  ];

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD' = 'NGN') => {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(currency === 'USD' ? amount / 1600 : amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      paid: { className: 'bg-success/10 text-success border-success/20', label: 'Paid' },
      pending: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
      partial: { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Partial' },
      overdue: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Overdue' },
    };
    const config = variants[status] || { className: 'bg-muted', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCustomerTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      hospital: 'bg-primary/10 text-primary',
      pharmacy: 'bg-emerald-500/10 text-emerald-600',
      clinic: 'bg-sky-500/10 text-sky-600',
      ngo: 'bg-purple-500/10 text-purple-600',
      wholesaler: 'bg-orange-500/10 text-orange-600',
    };
    return (
      <Badge variant="outline" className={`${styles[type] || 'bg-muted'} text-xs`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getDaysOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'paid') return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentType === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalValue = filteredOrders.reduce((sum, o) => sum + o.amount, 0);
  const paidCount = filteredOrders.filter(o => o.paymentStatus === 'paid').length;
  const pendingValue = filteredOrders
    .filter(o => o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor all sales orders, payments, and delivery status in real-time
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Order Value</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{filteredOrders.length}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Orders</p>
                <p className="text-2xl font-bold mt-1 text-success">{paidCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Value</p>
                <p className="text-2xl font-bold mt-1 text-warning">
                  {formatCurrency(pendingValue)}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-warning opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No orders found matching your filters.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const daysOverdue = getDaysOverdue(order.dueDate, order.paymentStatus);

                return (
                  <div
                    key={order.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{order.customer}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="font-mono text-foreground">{order.id}</span>
                            <span>•</span>
                            <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{order.items} items</span>
                            <span>•</span>
                            <span>{order.salesperson}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getCustomerTypeBadge(order.customerType)}
                          {daysOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              {daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 lg:mt-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono">
                          {formatCurrency(order.amount, order.currency)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          {getStatusBadge(order.paymentStatus)}
                          <Badge variant="outline" className="text-xs">
                            {order.paymentType === 'cash' ? 'Cash' : 'Credit'}
                          </Badge>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}