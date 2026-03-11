# MISSING BACKEND API ENDPOINTS - DETAILED SPECIFICATION

## Authentication & User Management

### 1. Password Reset
```typescript
POST /auth/password-reset
Request: {
  email: string;
  resetToken?: string;
  newPassword?: string;
}
Response: {
  message: string;
  resetToken?: string; // if first step
}
Status: ❌ NOT IMPLEMENTED
Related UI: None visible (feature missing from UI)
Priority: MEDIUM
```

### 2. Change Password
```typescript
POST /users/{userId}/change-password
Request: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
Response: {
  success: boolean;
  message: string;
}
Status: ❌ NOT IMPLEMENTED (TODO in code)
Related UI: src/components/dashboard/admin/settings/index.tsx
Priority: HIGH
Found at: Line 24 with comment "// TODO: integrate API call here"
```

### 3. Staff Summary (May exist, verify)
```typescript
GET /users/staff-summary
Response: {
  total: number;
  administrators: number;
  salesStaff: number;
  warehouseStaff: number;
  financeStaff: number;
}
Status: ⚠️ REFERENCED (verify implementation)
Related File: userService.ts
```

---

## Sales Order Management

### 1. Approve Sales Order ⭐ CRITICAL
```typescript
PATCH /sales-orders/{orderId}/approve
Request: {
  orderId: string;
  approvedBy: string;
  approvalNotes?: string;
}
Response: {
  success: boolean;
  order: SalesOrder;
  message: string;
}
Status: ❌ NOT IMPLEMENTED
Related UI: src/components/dashboard/finance-admin/order-approvals/index.tsx
Priority: CRITICAL
Mock Data: Lines 53-263 (entire component uses mock)
```

### 2. Reject Sales Order ⭐ CRITICAL
```typescript
PATCH /sales-orders/{orderId}/reject
Request: {
  orderId: string;
  rejectionReason: string;
  rejectedBy: string;
}
Response: {
  success: boolean;
  order: SalesOrder;
  message: string;
}
Status: ❌ NOT IMPLEMENTED
Related UI: src/components/dashboard/finance-admin/order-approvals/index.tsx
Priority: CRITICAL
```

### 3. Bulk Approve Orders ⭐ CRITICAL
```typescript
PATCH /sales-orders/bulk-approve
Request: {
  orderIds: string[];
  approvedBy: string;
}
Response: {
  success: boolean;
  processed: number;
  failed: number;
  orders: SalesOrder[];
}
Status: ❌ NOT IMPLEMENTED
Related UI: Order approval dialog (bulk action)
Priority: HIGH
```

---

## Financial Management

### 1. Get Financial Summary ⭐ CRITICAL
```typescript
GET /financial/summary
Query Parameters: {
  from?: Date; // ISO string
  to?: Date;   // ISO string
  currency?: 'NGN' | 'USD';
}
Response: {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  ordersCount: number;
  shipmentsCount: number;
  averageOrderValue: number;
  trendData: {
    date: string;
    revenue: number;
    cost: number;
  }[];
}
Status: ❌ NOT IMPLEMENTED
Related UI: src/app/dashboard/finance-admin/financial-reports/page.tsx
Priority: CRITICAL
```

### 2. Generate Financial Report
```typescript
POST /financial/reports/generate
Request: {
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  from: Date;
  to: Date;
  format?: 'json';
  includeDetails?: boolean;
}
Response: {
  reportId: string;
  data: {
    summary: FinancialSummary;
    details: {
      sales: SalesReport[];
      payments: PaymentReport[];
      receivables: ReceivableReport[];
    };
  };
}
Status: ❌ NOT IMPLEMENTED
Related UI: Financial reports page
Priority: HIGH
```

### 3. Export Financial Report
```typescript
POST /financial/reports/{reportId}/export
Query Parameters: {
  format: 'pdf' | 'csv' | 'xlsx' | 'docx';
}
Response: File binary
Status: ❌ NOT IMPLEMENTED
Related UI: Export button on financial reports page
Priority: MEDIUM
```

---

## Credit Management

### 1. Get Credit Analysis ⭐ CRITICAL
```typescript
GET /credit/analysis
Query Parameters: {
  customerId?: string; // Optional: single customer analysis
  sortField?: 'riskLevel' | 'creditUsed' | 'overdueAmount';
  sortOrder?: 'asc' | 'desc';
  riskLevel?: 'low' | 'medium' | 'high'; // Filter
  page?: number;
  limit?: number;
}
Response: {
  data: {
    id: string;
    name: string;
    type: 'hospital' | 'pharmacy' | 'clinic' | 'ngo' | 'wholesaler';
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
    overdueAmount: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number; // 0-100
    paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
    agedReceivables: {
      current: number;
      '30days': number;
      '60days': number;
      '90days': number;
      '90plus': number;
    };
  }[];
  meta: PaginationMeta;
}
Status: ❌ NOT IMPLEMENTED
Related UI: src/app/dashboard/finance-admin/credit-management/page.tsx
Priority: CRITICAL
Note: Currently uses mock data (hardcoded customers)
```

### 2. Update Credit Limit
```typescript
PATCH /credit/{customerId}/limit
Request: {
  newLimit: number;
  reason?: string;
  updatedBy: string;
}
Response: {
  success: boolean;
  customer: Customer;
  previousLimit: number;
  newLimit: number;
}
Status: ❌ NOT IMPLEMENTED
Related UI: Credit management customer detail view
Priority: HIGH
```

### 3. Get Risk Assessment
```typescript
GET /credit/{customerId}/risk-assessment
Response: {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  score: number;
  recommendations: string[];
  lastReviewDate: string;
}
Status: ❌ NOT IMPLEMENTED
Priority: MEDIUM
```

---

## Inventory & Stock Management

### 1. Adjust Stock ⭐ CRITICAL
```typescript
PATCH /inventory/{medicineId}/adjust-stock
Request: {
  quantity: number; // Positive for increase, negative for decrease
  reason: 'damage' | 'expiry' | 'recount' | 'sale' | 'return' | 'correction';
  batchNumber?: string;
  notes?: string;
  adjustedBy: string;
}
Response: {
  success: boolean;
  newQuantity: number;
  previousQuantity: number;
  adjustment: InventoryAdjustment;
}
Status: ❌ NOT IMPLEMENTED
Related UI: Stock management pages (warehouse, admin)
Priority: HIGH
```

### 2. Mark Batch as Expired
```typescript
PATCH /inventory/{medicineId}/batches/{batchId}/mark-expired
Request: {
  reason?: string;
  markedBy: string;
}
Response: {
  success: boolean;
  batch: ShipmentItem;
}
Status: ❌ NOT IMPLEMENTED
Related UI: Inventory management
Priority: HIGH
```

### 3. Scan Barcode
```typescript
POST /inventory/scan-barcode
Request: {
  barcode: string;
  action?: 'receive' | 'verify' | 'lookup';
}
Response: {
  success: boolean;
  medicine: {
    id: string;
    name: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    status: string;
  };
}
Status: ❌ NOT IMPLEMENTED
Related UI: src/components/shared/barcode-scanner/
Priority: MEDIUM
```

---

## Distribution & Order History

### 1. Get Distributor Order History
```typescript
GET /distributors/{distributorId}/orders
Query Parameters: {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}
Response: {
  data: SalesOrder[];
  meta: PaginationMeta;
}
Status: ❌ NOT IMPLEMENTED (Coming Soon)
Related UI: src/app/dashboard/super-admin/distributors/page.tsx:427
Priority: MEDIUM
```

### 2. Get Distributor Analytics
```typescript
GET /distributors/{distributorId}/analytics
Response: {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  orderFrequency: {
    '30days': number;
    '60days': number;
    '90days': number;
  };
  topProducts: {
    medicineId: string;
    medicineName: string;
    totalQuantity: number;
    totalSpent: number;
  }[];
}
Status: ❌ NOT IMPLEMENTED (Coming Soon)
Related UI: src/app/dashboard/super-admin/distributors/page.tsx:434
Priority: MEDIUM
```

---

## Document Management

### 1. Upload Shipment Documents ⚠️
```typescript
POST /shipments/{shipmentId}/documents
Content-Type: multipart/form-data
Request: {
  documents: File[]; // Multiple files allowed
  documentType: 'invoice' | 'quality-check' | 'packing-list' | 'insurance';
  uploadedBy: string;
}
Response: {
  success: boolean;
  documents: ShipmentDocument[];
}
Status: ⚠️ UNCLEAR (referenced but implementation unclear)
Related UI: src/app/dashboard/warehouse-admin/shipments/page.tsx
Priority: MEDIUM
Note: UI has file input for: invoiceDoc, qualityCheck, packingList, insurance
```

### 2. Delete Document
```typescript
DELETE /documents/{documentId}
Response: {
  success: boolean;
}
Status: ⚠️ UNCLEAR
Priority: LOW
```

---

## Export & Reporting

### 1. Export Orders to CSV/Excel/PDF
```typescript
POST /export/orders
Request: {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}
Response: File binary
Status: ❌ NOT IMPLEMENTED
Related UI: Multiple order list pages with export buttons
Priority: MEDIUM
```

### 2. Export Inventory
```typescript
POST /export/inventory
Request: {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: {
    form?: string;
    stockStatus?: string;
  };
}
Response: File binary
Status: ❌ NOT IMPLEMENTED
Priority: MEDIUM
```

### 3. Export Shipments
```typescript
POST /export/shipments
Request: {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}
Response: File binary
Status: ❌ NOT IMPLEMENTED
Priority: MEDIUM
```

---

## System Settings (Admin Only)

### 1. Get System Settings
```typescript
GET /settings/system
Response: {
  company: {
    name: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
  };
  business: {
    currency: 'NGN' | 'USD';
    taxRate: number;
    discountPolicy: string;
  };
  inventory: {
    lowStockThreshold: number;
    expiryWarningDays: number;
  };
}
Status: ❌ NOT IMPLEMENTED
Priority: LOW
```

### 2. Update System Settings
```typescript
POST /settings/system
Request: {
  company?: object;
  business?: object;
  inventory?: object;
  updatedBy: string;
}
Response: {
  success: boolean;
  settings: SystemSettings;
}
Status: ❌ NOT IMPLEMENTED
Priority: LOW
```

---

## Summary Table

| Endpoint | Method | Status | Priority | Related Page |
|----------|--------|--------|----------|--------------|
| /auth/password-reset | POST | ❌ | MEDIUM | None |
| /users/{id}/change-password | POST | ❌ | HIGH | settings |
| /sales-orders/{id}/approve | PATCH | ❌ | CRITICAL | order-approvals |
| /sales-orders/{id}/reject | PATCH | ❌ | CRITICAL | order-approvals |
| /sales-orders/bulk-approve | PATCH | ❌ | HIGH | order-approvals |
| /financial/summary | GET | ❌ | CRITICAL | financial-reports |
| /financial/reports/generate | POST | ❌ | HIGH | financial-reports |
| /financial/reports/{id}/export | POST | ❌ | MEDIUM | financial-reports |
| /credit/analysis | GET | ❌ | CRITICAL | credit-management |
| /credit/{id}/limit | PATCH | ❌ | HIGH | credit-management |
| /credit/{id}/risk-assessment | GET | ❌ | MEDIUM | credit-management |
| /inventory/{id}/adjust-stock | PATCH | ❌ | HIGH | stocks |
| /inventory/{id}/batches/{bId}/mark-expired | PATCH | ❌ | HIGH | inventory |
| /inventory/scan-barcode | POST | ❌ | MEDIUM | barcode-scanner |
| /distributors/{id}/orders | GET | ❌ | MEDIUM | distributors |
| /distributors/{id}/analytics | GET | ❌ | MEDIUM | distributors |
| /shipments/{id}/documents | POST | ⚠️ | MEDIUM | shipments |
| /export/orders | POST | ❌ | MEDIUM | orders pages |
| /export/inventory | POST | ❌ | MEDIUM | stocks pages |
| /export/shipments | POST | ❌ | MEDIUM | shipments pages |
| /settings/system | GET | ❌ | LOW | settings |
| /settings/system | POST | ❌ | LOW | settings |

---

**Total Missing Endpoints:** 21  
**Critical Priority:** 4  
**High Priority:** 6  
**Medium Priority:** 10  
**Low Priority:** 2  

**Last Updated:** January 19, 2026
