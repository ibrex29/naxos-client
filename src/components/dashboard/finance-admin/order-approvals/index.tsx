'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  Clock,
  FileText,
  CheckSquare,
  RefreshCw
} from 'lucide-react';
import { useApproveSalesOrder, useBulkApproveSalesOrders, useRejectSalesOrder, useSalesOrders } from '@/hooks/use-sales';
import type { SalesOrder, SalesOrderStatus } from '@/app/api/service/salesService';

export function OrderApprovals() {
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const limit = 10;

  const isSalesOrderStatus = (value: string): value is SalesOrderStatus =>
    value === 'DRAFT' || value === 'PENDING_APPROVAL' || value === 'APPROVED' || value === 'REJECTED';

  const orderStatusParam = statusFilter === 'all' ? undefined : (isSalesOrderStatus(statusFilter) ? statusFilter : undefined);

  const salesOrdersQuery = useSalesOrders({
    page,
    limit,
    sortOrder: 'asc',
    sortField: 'createdAt',
    search: searchTerm || undefined,
    orderStatus: orderStatusParam,
  });

  const approveMutation = useApproveSalesOrder();
  const rejectMutation = useRejectSalesOrder();
  const bulkApproveMutation = useBulkApproveSalesOrders();

  const orders = useMemo(() => salesOrdersQuery.data?.data ?? [], [salesOrdersQuery.data?.data]);
  const meta = salesOrdersQuery.data?.meta;
  const loading = salesOrdersQuery.isLoading || salesOrdersQuery.isFetching;
  const processing = approveMutation.isPending || rejectMutation.isPending || bulkApproveMutation.isPending;

  const getOrderStatus = (order: SalesOrder) => order.status;


  // Reset pagination + selection when filters/search change
  useEffect(() => {
    setPage(1);
    setSelectedOrders(new Set());
    setExpandedOrder(null);
  }, [searchTerm, statusFilter, currencyFilter]);

  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.distributor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || getOrderStatus(order) === statusFilter;
      const matchesCurrency = currencyFilter === 'all' || order.currency === currencyFilter;

      return matchesSearch && matchesStatus && matchesCurrency;
    });

    // Sort by creation date (most recent first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, currencyFilter]);

  const handleApprove = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowApprovalDialog(true);
  };

  const handleReject = (order: SalesOrder) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setShowRejectionDialog(true);
  };

  const confirmApproval = async () => {
    if (!selectedOrder) return;
    try {
      await approveMutation.mutateAsync({
        orderId: selectedOrder.id,
      });

      toast.success(`Order #${selectedOrder.id.slice(0, 8)}... has been approved`);
      setShowApprovalDialog(false);
      setSelectedOrder(null);
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedOrder.id);
        return newSet;
      });

      await salesOrdersQuery.refetch();
    } catch {
      toast.error('Failed to approve order');
    }
  };

  const confirmRejection = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        orderId: selectedOrder.id,
        rejectionReason: rejectionReason,
      });

      toast.success(`Order #${selectedOrder.id.slice(0, 8)}... has been rejected`);
      setShowRejectionDialog(false);
      setSelectedOrder(null);
      setRejectionReason('');
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedOrder.id);
        return newSet;
      });

      await salesOrdersQuery.refetch();
    } catch {
      toast.error('Failed to reject order');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders to approve');
      return;
    }
    try {
      const orderIds = filteredOrders
        .filter((order) => selectedOrders.has(order.id) && getOrderStatus(order) === 'PENDING_APPROVAL')
        .map((order) => order.id);

      if (orderIds.length === 0) {
        toast.error('No pending orders selected');
        return;
      }

      await bulkApproveMutation.mutateAsync({ orderIds });

      toast.success(`${orderIds.length} order(s) approved successfully`);
      setSelectedOrders(new Set());

      await salesOrdersQuery.refetch();
    } catch {
      toast.error('Failed to approve orders');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.filter(o => getOrderStatus(o) === 'PENDING_APPROVAL').length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.filter(o => getOrderStatus(o) === 'PENDING_APPROVAL').map(o => o.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'PENDING_APPROVAL':
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const pendingCount = orders.filter(o => getOrderStatus(o) === 'PENDING_APPROVAL').length;
  const approvedCount = orders.filter(o => getOrderStatus(o) === 'APPROVED').length;
  const rejectedCount = orders.filter(o => getOrderStatus(o) === 'REJECTED').length;
  const pendingValue = orders
    .filter(o => getOrderStatus(o) === 'PENDING_APPROVAL')
    .reduce((sum, o) => sum + o.orderAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            Order Approvals
          </h1>
          <p className="text-muted-foreground">
            Review and approve sales orders before processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || !meta?.hasPreviousPage}
          >
            Prev
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {meta?.page ?? page} / {meta?.pageCount ?? 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || !meta?.hasNextPage}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => salesOrdersQuery.refetch()}
            disabled={loading}
          >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Value</p>
                <p className="text-lg font-bold">
                  {formatCurrency(pendingValue, 'NGN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Actions
            </CardTitle>
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedOrders.size} selected
                </span>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
              </div>
            )}
          </div>
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
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'PENDING_APPROVAL' || currencyFilter !== 'all'
                  ? 'Try adjusting your filters to see more orders.'
                  : 'No orders pending approval.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {filteredOrders.some(o => getOrderStatus(o) === 'PENDING_APPROVAL') && (
                      <input
                        type="checkbox"
                        checked={
                          selectedOrders.size > 0 &&
                          selectedOrders.size ===
                            filteredOrders.filter(o => getOrderStatus(o) === 'PENDING_APPROVAL').length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-input"
                      />
                    )}
                  </TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <>
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        {getOrderStatus(order) === 'PENDING_APPROVAL' && (
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="rounded border-input"
                          />
                        )}
                      </TableCell>
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
                        <div className="font-medium">
                          {formatCurrency(order.orderAmount, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(getOrderStatus(order) ?? 'UNKNOWN')}</TableCell>
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
                          {getOrderStatus(order) === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(order)}
                                disabled={processing}
                                className="bg-success text-success-foreground hover:bg-success/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(order)}
                                disabled={processing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details */}
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold mb-2">Order Items:</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm border rounded p-2"
                                  >
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
                                      <div>
                                        {item.quantity} units × {formatCurrency(item.unitPrice, order.currency)}
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(item.quantity * item.unitPrice, order.currency)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                              <h4 className="font-semibold mb-2">Customer Details:</h4>
                              <div className="text-sm bg-muted/50 rounded p-3 space-y-1">
                                <div><strong>Email:</strong> {order.distributor.email}</div>
                                <div><strong>Phone:</strong> {order.distributor.phone}</div>
                                <div><strong>Address:</strong> {order.distributor.address}</div>
                                <div>
                                  <strong>Credit Limit:</strong>{' '}
                                  {formatCurrency(order.distributor.creditLimit, order.distributor.currency)}
                                </div>
                              </div>
                            </div>

                            {/* Approval/Rejection Info */}
                            {getOrderStatus(order) === 'APPROVED' && order.approvedById && (
                              <div className="bg-success/10 border border-success/20 rounded p-3">
                                <div className="flex items-center gap-2 text-success mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-semibold">Approved</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div><strong>Approved by:</strong> {order.approvedById}</div>
                                  {order.approvedAt && (
                                    <div><strong>Approved at:</strong> {formatDate(order.approvedAt)}</div>
                                  )}
                                  {order.approvalNotes && (
                                    <div className="mt-2">
                                      <strong>Notes:</strong>
                                      <p className="mt-1 text-muted-foreground">{order.approvalNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {getOrderStatus(order) === 'REJECTED' && order.rejectedById && (
                              <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                                <div className="flex items-center gap-2 text-destructive mb-2">
                                  <XCircle className="h-4 w-4" />
                                  <span className="font-semibold">Rejected</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div><strong>Rejected by:</strong> {order.rejectedById}</div>
                                  {order.rejectedAt && (
                                    <div><strong>Rejected at:</strong> {formatDate(order.rejectedAt)}</div>
                                  )}
                                  {order.rejectionReason && (
                                    <div className="mt-2">
                                      <strong>Reason:</strong>
                                      <p className="mt-1 text-muted-foreground">{order.rejectionReason}</p>
                                    </div>
                                  )}
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

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this order? This will allow the order to proceed to payment and fulfillment.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 py-4">
              <div className="border rounded p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID:</span>
                  <span className="text-sm font-medium">#{selectedOrder.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer:</span>
                  <span className="text-sm font-medium">{selectedOrder.distributor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedOrder.orderAmount, selectedOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Items:</span>
                  <span className="text-sm font-medium">{selectedOrder.items.length}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={confirmApproval} disabled={processing} className="bg-success hover:bg-success/90">
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order. This will notify the sales team.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="border rounded p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID:</span>
                  <span className="text-sm font-medium">#{selectedOrder.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer:</span>
                  <span className="text-sm font-medium">{selectedOrder.distributor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedOrder.orderAmount, selectedOrder.currency)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rejection Reason *</label>
                <Textarea
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejection}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
