import { Medicine, Order, Staff, StockAlert } from "@/types";

export const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol",
    brand: "Crocin",
    type: "tablet",
    dosage: "650mg",
    manufacturer: "GSK",
    purchasePrice: 2.5,
    sellingPrice: 4.0,
    currentStock: 500,
    minStockThreshold: 50,
    batchNumber: "PC2024001",
    expiryDate: "2025-12-31",
    supplierName: "MedSupply Co.",
    unitSize: "Strip of 15"
  },
  {
    id: "2",
    name: "Amoxicillin",
    brand: "Amoxil",
    type: "capsule",
    dosage: "500mg",
    manufacturer: "Cipla",
    purchasePrice: 8.0,
    sellingPrice: 12.0,
    currentStock: 25,
    minStockThreshold: 30,
    batchNumber: "AM2024002",
    expiryDate: "2025-08-15",
    supplierName: "PharmaCorp",
    unitSize: "Strip of 10"
  },
  {
    id: "3",
    name: "Cetirizine",
    brand: "Zyrtec",
    type: "tablet",
    dosage: "10mg",
    manufacturer: "Johnson & Johnson",
    purchasePrice: 3.0,
    sellingPrice: 5.0,
    currentStock: 200,
    minStockThreshold: 40,
    batchNumber: "CT2024003",
    expiryDate: "2026-01-20",
    supplierName: "MedSupply Co.",
    unitSize: "Strip of 10"
  },
  {
    id: "4",
    name: "Cough Syrup",
    brand: "Benadryl",
    type: "syrup",
    dosage: "100ml",
    manufacturer: "Johnson & Johnson",
    purchasePrice: 45.0,
    sellingPrice: 65.0,
    currentStock: 15,
    minStockThreshold: 20,
    batchNumber: "CS2024004",
    expiryDate: "2024-11-30",
    supplierName: "PharmaCorp",
    unitSize: "Bottle"
  },
  {
    id: "5",
    name: "Insulin",
    brand: "Lantus",
    type: "injection",
    dosage: "100 IU/ml",
    manufacturer: "Sanofi",
    purchasePrice: 450.0,
    sellingPrice: 650.0,
    currentStock: 80,
    minStockThreshold: 25,
    batchNumber: "IN2024005",
    expiryDate: "2025-06-30",
    supplierName: "BioPharma Ltd.",
    unitSize: "Vial"
  }
];

export const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "Rajesh Kumar",
    customerPhone: "+91-9876543210",
    medicines: [
      {
        medicineId: "1",
        medicineName: "Paracetamol",
        quantity: 2,
        unitPrice: 4.0,
        totalPrice: 8.0
      }
    ],
    totalAmount: 8.0,
    paymentMode: "cash",
    status: "completed",
    createdBy: "sales_user_1",
    createdAt: "2024-01-15T10:30:00Z",
    paymentStatus: "paid"
  },
  {
    id: "ORD002",
    customerName: "Priya Sharma",
    customerPhone: "+91-9876543211",
    medicines: [
      {
        medicineId: "2",
        medicineName: "Amoxicillin",
        quantity: 1,
        unitPrice: 12.0,
        totalPrice: 12.0
      },
      {
        medicineId: "3",
        medicineName: "Cetirizine",
        quantity: 1,
        unitPrice: 5.0,
        totalPrice: 5.0
      }
    ],
    totalAmount: 17.0,
    paymentMode: "card",
    status: "completed",
    createdBy: "sales_user_2",
    createdAt: "2024-01-15T14:15:00Z",
    paymentStatus: "paid"
  }
];

export const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Dr. Anita Verma",
    role: "admin",
    email: "anita.verma@pharmacare.com",
    phone: "+91-9876543200",
    status: "active",
    createdAt: "2023-06-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Ravi Gupta",
    role: "sales",
    email: "ravi.gupta@pharmacare.com",
    phone: "+91-9876543201",
    status: "active",
    createdAt: "2023-07-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Sunita Patel",
    role: "warehouse",
    email: "sunita.patel@pharmacare.com",
    phone: "+91-9876543202",
    status: "active",
    createdAt: "2023-08-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Vikram Singh",
    role: "sales",
    email: "vikram.singh@pharmacare.com",
    phone: "+91-9876543203",
    status: "inactive",
    createdAt: "2023-09-10T00:00:00Z"
  }
];

export const mockAlerts: StockAlert[] = [
  {
    id: "1",
    medicineId: "2",
    medicineName: "Amoxicillin",
    type: "low_stock",
    message: "Stock below minimum threshold (25 units remaining)",
    severity: "high",
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "2",
    medicineId: "4",
    medicineName: "Cough Syrup",
    type: "expiry_warning",
    message: "Expires in 30 days (2024-11-30)",
    severity: "medium",
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "3",
    medicineId: "4",
    medicineName: "Cough Syrup",
    type: "low_stock",
    message: "Stock below minimum threshold (15 units remaining)",
    severity: "medium",
    createdAt: "2024-01-15T08:00:00Z"
  }
];