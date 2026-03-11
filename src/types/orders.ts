export type ApprovalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  form: string;
  manufacturer: string;
  manufacturingDate: string;
  packSize: number;
  countryOfOrigin: string;
  shipmentItems: Array<{
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface Distributor {
  id: string;
  name: string;
  code: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  medicine: {
    id: string;
    name: string;
    strength: string;
    form: string;
    manufacturer: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: 'CASH' | 'CREDIT' | 'BANK_TRANSFER';
  createdAt: string;
  entityType?: 'SalesOrder';
  entityId?: string;
  distributorId?: string;
  salesOrderId?: string;
}

export interface SalesOrder {
  id: string;
  distributorId: string;
  salesRepId: string;
  currency: 'NGN' | 'USD';
  // Backend uses `status`; older UI used `approvalStatus`
  status?: ApprovalStatus;
  approvalStatus?: ApprovalStatus;
  paymentStatus: PaymentStatus;
  orderAmount: number;
  amountPaid: number;
  amountRemaining: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedById?: string | null;
  approvalNotes?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string;
  rejectedById?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  distributor: Distributor;
  salesRep: {
    id: string;
    email: string;
  };
  items: OrderItem[];
  payments: Payment[];
}
