export type UserRole = 'admin' | 'sales' | 'warehouse';

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  type: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'ointment';
  dosage: string;
  manufacturer: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockThreshold: number;
  batchNumber: string;
  expiryDate: string;
  supplierName: string;
  unitSize: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  medicines: OrderItem[];
  totalAmount: number;
  paymentMode: 'cash' | 'card' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  paymentStatus: 'paid' | 'pending';
}

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'low_stock' | 'expiry_warning' | 'expired';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  topSellingMedicines: Array<{
    medicineId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
  }>;
}