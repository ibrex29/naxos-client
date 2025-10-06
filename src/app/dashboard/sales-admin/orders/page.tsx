'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  CreditCard, 
  Calendar, 
  User, 
  Building2,
  Package,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { PaymentModal } from '@/components/payment-modal';
import { SalesOrder, SalesOrderQueryParams } from '@/app/api/service/salesService';
import { useSalesManagement } from '@/hooks/use-sales';

export default function OrdersListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Query parameters for fetching sales orders
  const queryParams: SalesOrderQueryParams = {
    search: searchTerm || undefined,
    paymentStatus: statusFilter !== 'all' ? statusFilter as SalesOrder['paymentStatus'] : undefined,
    currency: currencyFilter !== 'all' ? currencyFilter as 'NGN' | 'USD' : undefined,
    sortField: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  };

  // Use sales management hook
  const { 
    salesOrders, 
    isLoadingSalesOrders, 
    salesOrdersError, 
    createPayment,
    refetchSalesOrders 
  } = useSalesManagement(queryParams);

  const handlePayment = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (updatedOrder: SalesOrder) => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-success text-success-foreground">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'PARTIAL':
        return <Badge className="bg-warning text-warning-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </Badge>;
      case 'PENDING':
        return <Badge className="bg-destructive text-destructive-foreground">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return '💵';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'CREDIT':
        return '💳';
      default:
        return '💰';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const pendingOrders = salesOrders?.data.filter(o => o.paymentStatus === 'PENDING').length || 0;
  const partialOrders = salesOrders?.data.filter(o => o.paymentStatus === 'PARTIAL').length || 0;
  const totalValue = salesOrders?.data.reduce((sum, o) => sum + o.orderAmount, 0) || 0;
  const totalPaid = salesOrders?.data.reduce((sum, o) => sum + o.amountPaid, 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6" />
            Sales Orders
          </h1>
          <p className="text-muted-foreground">
            Manage and process customer orders and payments
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => salesOrders?.meta && salesOrders.meta.hasNextPage && refetchSalesOrders()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold text-destructive">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Partial Payment</p>
                <p className="text-2xl font-bold text-warning">{partialOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{salesOrders?.data.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-success">
                  {totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full lg:w-[120px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currency</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent>
          {isLoadingSalesOrders ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : salesOrdersError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading orders</h3>
              <p className="text-muted-foreground">{salesOrdersError.message}</p>
            </div>
          ) : !salesOrders || salesOrders.data.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || currencyFilter !== 'all'
                  ? 'Try adjusting your filters to see more orders.'
                  : 'No orders have been created yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesOrders.data.map((order) => (
                  <>
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">#{order.id.slice(0, 8)}...</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.distributor.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {order.distributor.code} - {order.distributor.type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(order.orderAmount, order.currency)}
                          </div>
                          {order.amountPaid > 0 && (
                            <div className="text-sm text-success">
                              Paid: {formatCurrency(order.amountPaid, order.currency)}
                            </div>
                          )}
                          {order.amountRemaining > 0 && (
                            <div className="text-sm text-destructive">
                              Due: {formatCurrency(order.amountRemaining, order.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {order.salesRep.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.paymentStatus !== 'PAID' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayment(order)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold mb-2">Order Items:</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm border rounded p-2">
                                    <div>
                                      <span className="font-medium">{item.medicine.name}</span>
                                      <span className="text-muted-foreground ml-2">
                                        ({item.medicine.strength} {item.medicine.form})
                                      </span>
                                      <span className="text-muted-foreground ml-2">
                                        - {item.medicine.manufacturer}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div>{item.quantity} units × {formatCurrency(item.unitPrice, order.currency)}</div>
                                      <div className="font-medium">
                                        {formatCurrency(item.quantity * item.unitPrice, order.currency)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Payment History */}
                            {order.payments.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Payment History:</h4>
                                <div className="space-y-2">
                                  {order.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between text-sm border rounded p-2">
                                      <div className="flex items-center gap-2">
                                        <span>{getPaymentTypeIcon(payment.type)}</span>
                                        <span>{payment.type}</span>
                                        <span className="text-muted-foreground">
                                          on {formatDate(payment.createdAt)}
                                        </span>
                                      </div>
                                      <div className="font-medium text-success">
                                        {formatCurrency(payment.amount, payment.currency)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          open={showPaymentModal}
          onClose={handleModalClose}
          order={selectedOrder}
          onPaymentSuccess={handlePaymentSuccess}
          createPayment={createPayment}
        />
      )}
    </div>
  );
}