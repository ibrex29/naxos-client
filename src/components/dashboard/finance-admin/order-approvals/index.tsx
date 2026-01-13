'use client';

import { useState, useEffect } from 'react';
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
import { SalesOrder } from '@/types/orders';

export function OrderApprovals() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  // Mock data with approval statuses
  const mockOrders: SalesOrder[] = [
    {
      id: '91baeb6a-d9c5-4605-9af9-e38f130d9dbf',
      distributorId: '98fa8d05-a83a-4eec-8568-3c4ee43ac3ce',
      salesRepId: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
      currency: 'NGN',
      approvalStatus: 'PENDING_APPROVAL',
      paymentStatus: 'PENDING',
      orderAmount: 20000,
      amountPaid: 0,
      amountRemaining: 20000,
      createdAt: '2025-01-12T10:30:00.000Z',
      updatedAt: '2025-01-12T10:30:00.000Z',
      distributor: {
        id: '98fa8d05-a83a-4eec-8568-3c4ee43ac3ce',
        name: 'HealthPlus Pharmacy Ltd.',
        code: 'DX-0001',
        type: 'PHARMACY',
        email: 'contact@healthplus.com',
        phone: '+2348012345678',
        address: '23 Hospital Road, Kano, Nigeria',
        creditLimit: 500000,
        currency: 'NGN'
      },
      salesRep: {
        id: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
        email: 'sales@naxoshealthcare.com'
      },
      items: [
        {
          id: '536ec139-ce64-4513-bb5d-2ca08b76e9c6',
          medicineId: 'c569e156-dcf4-4e69-a02e-5d31542a246e',
          quantity: 10,
          unitPrice: 2000,
          medicine: {
            id: 'c569e156-dcf4-4e69-a02e-5d31542a246e',
            name: 'Pc',
            strength: '250n',
            form: 'Capsule',
            manufacturer: 'enzo'
          }
        }
      ],
      payments: []
    },
    {
      id: 'ord-pending-002',
      distributorId: 'dist-002',
      salesRepId: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
      currency: 'NGN',
      approvalStatus: 'PENDING_APPROVAL',
      paymentStatus: 'PENDING',
      orderAmount: 45000,
      amountPaid: 0,
      amountRemaining: 45000,
      createdAt: '2025-01-12T09:15:00.000Z',
      updatedAt: '2025-01-12T09:15:00.000Z',
      distributor: {
        id: 'dist-002',
        name: 'City General Hospital',
        code: 'DX-0002',
        type: 'HOSPITAL',
        email: 'procurement@citygeneral.com',
        phone: '+2348098765432',
        address: '15 Medical Center Drive, Lagos, Nigeria',
        creditLimit: 1000000,
        currency: 'NGN'
      },
      salesRep: {
        id: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
        email: 'sales@naxoshealthcare.com'
      },
      items: [
        {
          id: 'item-002-1',
          medicineId: 'med-002',
          quantity: 100,
          unitPrice: 150,
          medicine: {
            id: 'med-002',
            name: 'Paracetamol',
            strength: '500mg',
            form: 'Tablet',
            manufacturer: 'GSK'
          }
        },
        {
          id: 'item-002-2',
          medicineId: 'med-003',
          quantity: 50,
          unitPrice: 350,
          medicine: {
            id: 'med-003',
            name: 'Amoxicillin',
            strength: '250mg',
            form: 'Capsule',
            manufacturer: 'Pfizer'
          }
        }
      ],
      payments: []
    },
    {
      id: 'ord-approved-001',
      distributorId: 'dist-003',
      salesRepId: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
      currency: 'USD',
      approvalStatus: 'APPROVED',
      paymentStatus: 'PAID',
      orderAmount: 850,
      amountPaid: 850,
      amountRemaining: 0,
      createdAt: '2025-01-11T14:20:00.000Z',
      updatedAt: '2025-01-11T15:30:00.000Z',
      approvedBy: 'finance@naxoshealthcare.com',
      approvedAt: '2025-01-11T15:00:00.000Z',
      distributor: {
        id: 'dist-003',
        name: 'MedSupply Wholesalers',
        code: 'DX-0003',
        type: 'WHOLESALER',
        email: 'orders@medsupply.ng',
        phone: '+2349012345678',
        address: '78 Industrial Avenue, Abuja, Nigeria',
        creditLimit: 2000000,
        currency: 'NGN'
      },
      salesRep: {
        id: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
        email: 'sales@naxoshealthcare.com'
      },
      items: [
        {
          id: 'item-003-1',
          medicineId: 'med-001',
          quantity: 25,
          unitPrice: 34,
          medicine: {
            id: 'med-001',
            name: 'Aspirin',
            strength: '100mg',
            form: 'Tablet',
            manufacturer: 'Bayer'
          }
        }
      ],
      payments: [
        {
          id: 'pay-003',
          amount: 850,
          currency: 'USD',
          type: 'BANK_TRANSFER',
          createdAt: '2025-01-11T15:30:00.000Z'
        }
      ]
    },
    {
      id: 'ord-rejected-001',
      distributorId: '98fa8d05-a83a-4eec-8568-3c4ee43ac3ce',
      salesRepId: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
      currency: 'NGN',
      approvalStatus: 'REJECTED',
      paymentStatus: 'PENDING',
      orderAmount: 15000,
      amountPaid: 0,
      amountRemaining: 15000,
      createdAt: '2025-01-10T11:45:00.000Z',
      updatedAt: '2025-01-10T13:00:00.000Z',
      rejectedBy: 'finance@naxoshealthcare.com',
      rejectedAt: '2025-01-10T13:00:00.000Z',
      rejectionReason: 'Customer has exceeded credit limit. Payment required upfront.',
      distributor: {
        id: '98fa8d05-a83a-4eec-8568-3c4ee43ac3ce',
        name: 'HealthPlus Pharmacy Ltd.',
        code: 'DX-0001',
        type: 'PHARMACY',
        email: 'contact@healthplus.com',
        phone: '+2348012345678',
        address: '23 Hospital Road, Kano, Nigeria',
        creditLimit: 500000,
        currency: 'NGN'
      },
      salesRep: {
        id: 'd2d64bfa-2ce5-4a8a-b5a3-8e09581eb01d',
        email: 'sales@naxoshealthcare.com'
      },
      items: [
        {
          id: 'item-rej-001',
          medicineId: 'med-002',
          quantity: 100,
          unitPrice: 150,
          medicine: {
            id: 'med-002',
            name: 'Paracetamol',
            strength: '500mg',
            form: 'Tablet',
            manufacturer: 'GSK'
          }
        }
      ],
      payments: []
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.distributor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.approvalStatus === statusFilter;
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

    setProcessing(true);
    try {
      // Simulate API call to approve order
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedOrder: SalesOrder = {
        ...selectedOrder,
        approvalStatus: 'APPROVED',
        approvedBy: 'finance@naxoshealthcare.com',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      toast.success(`Order #${selectedOrder.id.slice(0, 8)}... has been approved`);
      setShowApprovalDialog(false);
      setSelectedOrder(null);
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedOrder.id);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to approve order');
    } finally {
      setProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      // Simulate API call to reject order
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedOrder: SalesOrder = {
        ...selectedOrder,
        approvalStatus: 'REJECTED',
        rejectedBy: 'finance@naxoshealthcare.com',
        rejectedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
        updatedAt: new Date().toISOString()
      };

      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      toast.success(`Order #${selectedOrder.id.slice(0, 8)}... has been rejected`);
      setShowRejectionDialog(false);
      setSelectedOrder(null);
      setRejectionReason('');
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedOrder.id);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to reject order');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders to approve');
      return;
    }

    setProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedOrders = orders.map(order => {
        if (selectedOrders.has(order.id) && order.approvalStatus === 'PENDING_APPROVAL') {
          return {
            ...order,
            approvalStatus: 'APPROVED' as const,
            approvedBy: 'finance@naxoshealthcare.com',
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      toast.success(`${selectedOrders.size} order(s) approved successfully`);
      setSelectedOrders(new Set());
    } catch (error) {
      toast.error('Failed to approve orders');
    } finally {
      setProcessing(false);
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
    if (selectedOrders.size === filteredOrders.filter(o => o.approvalStatus === 'PENDING_APPROVAL').length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.filter(o => o.approvalStatus === 'PENDING_APPROVAL').map(o => o.id)));
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

  const pendingCount = orders.filter(o => o.approvalStatus === 'PENDING_APPROVAL').length;
  const approvedCount = orders.filter(o => o.approvalStatus === 'APPROVED').length;
  const rejectedCount = orders.filter(o => o.approvalStatus === 'REJECTED').length;
  const pendingValue = orders
    .filter(o => o.approvalStatus === 'PENDING_APPROVAL')
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
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
                    {filteredOrders.some(o => o.approvalStatus === 'PENDING_APPROVAL') && (
                      <input
                        type="checkbox"
                        checked={
                          selectedOrders.size > 0 &&
                          selectedOrders.size ===
                            filteredOrders.filter(o => o.approvalStatus === 'PENDING_APPROVAL').length
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
                        {order.approvalStatus === 'PENDING_APPROVAL' && (
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
                      <TableCell>{getStatusBadge(order.approvalStatus)}</TableCell>
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
                          {order.approvalStatus === 'PENDING_APPROVAL' && (
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
                            {order.approvalStatus === 'APPROVED' && order.approvedBy && (
                              <div className="bg-success/10 border border-success/20 rounded p-3">
                                <div className="flex items-center gap-2 text-success mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-semibold">Approved</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div><strong>Approved by:</strong> {order.approvedBy}</div>
                                  {order.approvedAt && (
                                    <div><strong>Approved at:</strong> {formatDate(order.approvedAt)}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {order.approvalStatus === 'REJECTED' && order.rejectedBy && (
                              <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                                <div className="flex items-center gap-2 text-destructive mb-2">
                                  <XCircle className="h-4 w-4" />
                                  <span className="font-semibold">Rejected</span>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div><strong>Rejected by:</strong> {order.rejectedBy}</div>
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
