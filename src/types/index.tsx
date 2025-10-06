export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'warehouse' | 'finance';
  permissions: string[];
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  type: 'tablet' | 'syrup' | 'injection' | 'cream' | 'capsule';
  manufacturer: string;
  unitSize: string;
  dosage: string;
  purchasePrice: number;
  sellingPrice: number;
  discountPercentage: number;
  supplier: string;
  stock: number;
  minThreshold: number;
  batches: Batch[];
}

export interface Batch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  receivedDate: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  distributorId?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: 'USD' | 'NGN';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'partial';
  paymentType: 'cash' | 'credit';
  paymentMode: 'cash' | 'card' | 'transfer';
  createdAt: string;
  createdBy: string;
}

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  batchId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyDiscount: number;
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'expiry_warning' | 'overstock';
  medicineId: string;
  medicineName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  topMedicines: Array<{
    medicineId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface Distributor {
  id: string;
  name: string;
  type: 'wholesaler' | 'hospital' | 'clinic' | 'pharmacy' | 'ngo';
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  paymentTerms: 'cash' | 'credit';
  creditLimit?: number;
  totalPurchases: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Shipment {
  id: string;
  proformaInvoice: string;
  billOfLading: string;
  supplier: string;
  receivedDate: string;
  items: ShipmentItem[];
  status: 'pending' | 'received' | 'processed';
  createdBy: string;
  createdAt: string;
}

export interface ShipmentItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
}