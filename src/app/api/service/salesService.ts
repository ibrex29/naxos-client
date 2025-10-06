import authApi from '@/utils/authApi';

// Define enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

export enum PaymentType {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT = 'CREDIT',
}

// Interface for SalesOrderItem
export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
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

// Interface for Document
export interface Document {
  id: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedById: string;
  paymentId: string;
  createdAt: string;
}

// Interface for Payment
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  entityType: 'SalesOrder';
  entityId: string;
  distributorId: string;
  salesOrderId: string;
  createdAt: string;
  Document: Document[];
}

// Interface for SalesOrder
export interface SalesOrder {
  id: string;
  distributorId: string;
  salesRepId: string;
  currency: 'NGN' | 'USD';
  paymentStatus: PaymentStatus;
  orderAmount: number;
  amountPaid: number;
  amountRemaining: number;
  createdAt: string;
  updatedAt: string;
  distributor: {
    id: string;
    name: string;
    code: string;
    type: string;
    email: string;
    phone: string;
    address: string;
    creditLimit: number;
    currency: string;
  };
  salesRep: {
    id: string;
    email: string;
  };
  items: SalesOrderItem[];
  payments: Payment[];
}

// Interface for query parameters for fetching sales orders
export interface SalesOrderQueryParams {
  search?: string;
  paymentStatus?: PaymentStatus;
  currency?: 'NGN' | 'USD';
  sortField?: 'createdAt' | 'orderAmount' | 'distributor.name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Interface for paginated sales order response
export interface SalesOrderResponse {
  data: SalesOrder[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Interface for creating sales order item
export interface CreateSalesOrderItem {
  medicineId: string;
  quantity: number;
  unitPrice?: number;
}

// Interface for creating sales order payload
export interface CreateSalesOrderPayload {
  distributorId: string;
  currency: 'NGN' | 'USD';
  items: CreateSalesOrderItem[];
}

// Interface for creating payment payload
export interface CreatePaymentPayload {
  amount: number;
  currency: 'NGN' | 'USD';
  type: PaymentType;
  salesOrderId: string;
  documents?: Array<{
    url: string;
    fileName: string;
  }>;
}

// Interface for payment response
export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  entityType: 'SalesOrder';
  entityId: string;
  distributorId: string;
  salesOrderId: string;
  createdAt: string;
  Document: Document[];
}

// Fetch sales orders with pagination and filters
export const fetchSalesOrders = async (params: SalesOrderQueryParams = {}): Promise<SalesOrderResponse> => {
  const {
    search = '',
    paymentStatus = '',
    currency = '',
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = params;

  const queryParams = new URLSearchParams({
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
    sortField,
    ...(search && { search }),
    ...(paymentStatus && { paymentStatus }),
    ...(currency && { currency }),
  });

  const { data } = await authApi.get(`/sales-orders?${queryParams.toString()}`);
  return data;
};

// Create a new sales order
export const createSalesOrder = async (payload: CreateSalesOrderPayload): Promise<SalesOrder> => {
  const { data } = await authApi.post('/sales-orders', payload);
  return data;
};

// Create a new payment
export const createPayment = async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
  const { data } = await authApi.post('/payments', payload);
  return data;
};