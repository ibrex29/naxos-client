import { User, Medicine, Order, Customer, StockAlert, SalesReport, Distributor, Shipment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Adebayo Okafor',
    email: 'admin@naxospharm.com',
    role: 'admin',
    permissions: ['manage_staff', 'view_reports', 'approve_orders', 'manage_medicines']
  },
  {
    id: '2',
    name: 'Chioma Ugwu',
    email: 'sales@naxospharm.com',
    role: 'sales',
    permissions: ['create_orders', 'manage_customers', 'view_stock']
  },
  {
    id: '3',
    name: 'Ibrahim Hassan',
    email: 'warehouse@naxospharm.com',
    role: 'warehouse',
    permissions: ['manage_stock', 'view_inventory', 'update_batches']
  },
  {
    id: '4',
    name: 'Funmi Adebayo',
    email: 'finance@naxoshealthcare.com',
    role: 'finance',
    permissions: ['view_orders', 'manage_credits', 'generate_reports', 'track_payments']
  }
];

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    brand: 'Crocin',
    type: 'tablet',
    manufacturer: 'GSK',
    unitSize: '500mg',
    dosage: '1-2 tablets every 4-6 hours',
    purchasePrice: 150,
    costPrice: 150,
    sellingPrice: 250,
    discountPercentage: 5,
    supplier: 'MedSupply Co.',
    stock: 500,
    minThreshold: 100,
    batches: [
      {
        id: 'b1',
        batchNumber: 'PAR001',
        expiryDate: '2025-12-31',
        quantity: 300,
        receivedDate: '2024-01-15'
      },
      {
        id: 'b2',
        batchNumber: 'PAR002',
        expiryDate: '2025-06-30',
        quantity: 200,
        receivedDate: '2024-03-20'
      }
    ]
  },
  {
    id: '2',
    name: 'Amoxicillin',
    brand: 'Amoxil',
    type: 'capsule',
    manufacturer: 'Pfizer',
    unitSize: '250mg',
    dosage: '1 capsule 3 times daily',
    purchasePrice: 5.00,
    costPrice: 5.00,
    sellingPrice: 7.50,
    discountPercentage: 0,
    supplier: 'PharmaCorp',
    stock: 200,
    minThreshold: 50,
    batches: [
      {
        id: 'b3',
        batchNumber: 'AMX001',
        expiryDate: '2024-12-31',
        quantity: 200,
        receivedDate: '2024-02-10'
      }
    ]
  },
  {
    id: '3',
    name: 'Cough Syrup',
    brand: 'Benadryl',
    type: 'syrup',
    manufacturer: 'J&J',
    unitSize: '100ml',
    dosage: '5ml 3 times daily',
    purchasePrice: 8.00,
    costPrice: 8.00,
    sellingPrice: 12.00,
    discountPercentage: 10,
    supplier: 'MedSupply Co.',
    stock: 75,
    minThreshold: 25,
    batches: [
      {
        id: 'b4',
        batchNumber: 'SYR001',
        expiryDate: '2025-03-15',
        quantity: 75,
        receivedDate: '2024-01-25'
      }
    ]
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    phone: '+1234567890',
    email: 'alice@email.com',
    address: '123 Main St, City',
    loyaltyDiscount: 5
  },
  {
    id: '2',
    name: 'Bob Smith',
    phone: '+1234567891',
    loyaltyDiscount: 0
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Alice Johnson',
    distributorId: 'd1',
    items: [
      {
        medicineId: '1',
        medicineName: 'Paracetamol',
        quantity: 2,
        unitPrice: 3.50,
        discount: 0.18,
        batchId: 'b1'
      }
    ],
    totalAmount: 6.82,
    currency: 'NGN',
    status: 'completed',
    paymentStatus: 'paid',
    paymentType: 'cash',
    paymentMode: 'card',
    createdAt: '2024-09-19T10:30:00Z',
    createdBy: '2'
  },
  {
    id: '2',
    distributorId: 'd2',
    customerName: 'Lagos General Hospital',
    items: [
      {
        medicineId: '2',
        medicineName: 'Amoxicillin',
        quantity: 50,
        unitPrice: 7.50,
        discount: 0,
        batchId: 'b3'
      }
    ],
    totalAmount: 375.00,
    currency: 'USD',
    status: 'pending',
    paymentStatus: 'pending',
    paymentType: 'credit',
    paymentMode: 'transfer',
    createdAt: '2024-09-20T14:15:00Z',
    createdBy: '2'
  }
];

export const mockStockAlerts: StockAlert[] = [
  {
    id: '1',
    type: 'low_stock',
    medicineId: '3',
    medicineName: 'Cough Syrup',
    message: 'Stock below minimum threshold (25 units)',
    severity: 'medium',
    createdAt: '2024-09-19T08:00:00Z'
  },
  {
    id: '2',
    type: 'expiry_warning',
    medicineId: '2',
    medicineName: 'Amoxicillin',
    message: 'Batch AMX001 expires in 3 months',
    severity: 'high',
    createdAt: '2024-09-19T09:15:00Z'
  }
];

export const mockSalesReports: SalesReport[] = [
  {
    date: '2024-09-19',
    totalSales: 1250.50,
    totalOrders: 45,
    topMedicines: [
      {
        medicineId: '1',
        name: 'Paracetamol',
        quantity: 120,
        revenue: 420.00
      },
      {
        medicineId: '3',
        name: 'Cough Syrup',
        quantity: 25,
        revenue: 300.00
      }
    ]
  }
];

export const mockDistributors: Distributor[] = [
  {
    id: 'd1',
    name: 'MedCare Pharmacy Chain',
    type: 'pharmacy',
    contactPerson: 'Mrs. Adunni Okafor',
    phone: '+234-801-234-5678',
    email: 'procurement@medcare.ng',
    address: '45 Victoria Island, Lagos, Nigeria',
    paymentTerms: 'credit',
    creditLimit: 500000,
    totalPurchases: 1250000,
    lastOrderDate: '2024-09-18',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'd2',
    name: 'Lagos General Hospital',
    type: 'hospital',
    contactPerson: 'Dr. Emeka Obi',
    phone: '+234-802-345-6789',
    email: 'pharmacy@lgh.gov.ng',
    address: 'Broad Street, Lagos Island, Lagos',
    paymentTerms: 'credit',
    creditLimit: 2000000,
    totalPurchases: 3450000,
    lastOrderDate: '2024-09-20',
    status: 'active',
    createdAt: '2024-02-01T09:30:00Z'
  },
  {
    id: 'd3',
    name: 'Wellness Clinic Network',
    type: 'clinic',
    contactPerson: 'Dr. Fatima Abdullahi',
    phone: '+234-803-456-7890',
    address: '12 Wuse II, Abuja, Nigeria',
    paymentTerms: 'cash',
    totalPurchases: 750000,
    lastOrderDate: '2024-09-15',
    status: 'active',
    createdAt: '2024-03-10T14:20:00Z'
  },
  {
    id: 'd4',
    name: 'Doctors Without Borders Nigeria',
    type: 'ngo',
    contactPerson: 'Dr. Marie Dubois',
    phone: '+234-804-567-8901',
    email: 'supply@msf-ng.org',
    address: '7 Maitama District, Abuja',
    paymentTerms: 'credit',
    creditLimit: 1000000,
    totalPurchases: 2100000,
    lastOrderDate: '2024-09-12',
    status: 'active',
    createdAt: '2024-01-20T11:45:00Z'
  }
];

export const mockShipments: Shipment[] = [
  {
    id: 's1',
    proformaInvoice: 'PI-2024-001',
    billOfLading: 'BL-NGS-240920-001',
    supplier: 'GSK Nigeria Limited',
    receivedDate: '2024-09-20',
    items: [
      {
        medicineId: '1',
        medicineName: 'Paracetamol',
        batchNumber: 'PAR003',
        expiryDate: '2025-09-30',
        quantity: 1000,
        unitCost: 140
      }
    ],
    status: 'received',
    createdBy: '3',
    createdAt: '2024-09-20T08:30:00Z'
  },
  {
    id: 's2',
    proformaInvoice: 'PI-2024-002',
    billOfLading: 'BL-NGS-240921-002',
    supplier: 'Pfizer Nigeria',
    receivedDate: '2024-09-21',
    items: [
      {
        medicineId: '2',
        medicineName: 'Amoxicillin',
        batchNumber: 'AMX002',
        expiryDate: '2025-08-31',
        quantity: 500,
        unitCost: 4.5
      }
    ],
    status: 'pending',
    createdBy: '3',
    createdAt: '2024-09-21T07:15:00Z'
  }
];