# 🔴 ISSUE #001: Finance Admin Dashboard - Backend Integration Required

**Created:** January 28, 2026  
**Dashboard:** Finance Admin  
**Priority:** 🔴 CRITICAL  
**Assigned To:** Backend Team  
**Frontend Status:** ✅ 85% Complete  
**Backend Status:** ❌ 20% Complete  

---

## 📋 Summary

The Finance Admin Dashboard has complete UI components but lacks backend API endpoints. Users can navigate to all pages but data operations fail or fall back to mock data. This blocks critical financial workflows including order approvals, credit management, and financial reporting.

---

## 🚨 Critical Missing Endpoints

### 1. Order Approval System (Blocker)

**Location:** [src/components/dashboard/finance-admin/order-approvals/index.tsx](../src/components/dashboard/finance-admin/order-approvals/index.tsx)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/sales-orders/{orderId}/approve` | PATCH | ❌ Missing |
| `/sales-orders/{orderId}/reject` | PATCH | ❌ Missing |
| `/sales-orders/bulk-approve` | PATCH | ❌ Missing |
| `/sales-orders?status=PENDING_APPROVAL` | GET | ⚠️ Verify |

#### Required: Approve Order Endpoint
```typescript
PATCH /api/sales-orders/{orderId}/approve

Request Body:
{
  approvedBy: string;        // User ID of approver
  approvalNotes?: string;    // Optional notes
}

Response:
{
  success: boolean;
  order: SalesOrder;
  message: string;
}

// Expected status transitions:
// PENDING_APPROVAL → APPROVED → Can proceed to fulfillment
```

#### Required: Reject Order Endpoint
```typescript
PATCH /api/sales-orders/{orderId}/reject

Request Body:
{
  rejectionReason: string;   // Required - reason for rejection
  rejectedBy: string;        // User ID
}

Response:
{
  success: boolean;
  order: SalesOrder;
  message: string;
}
```

#### Required: Bulk Approve Orders Endpoint
```typescript
PATCH /api/sales-orders/bulk-approve

Request Body:
{
  orderIds: string[];        // Array of order IDs to approve
  approvedBy: string;
}

Response:
{
  success: boolean;
  results: {
    orderId: string;
    success: boolean;
    error?: string;
  }[];
  message: string;
}
```

---

### 2. Financial Reports System

**Location:** [src/app/dashboard/finance-admin/financial-reports/page.tsx](../src/app/dashboard/finance-admin/financial-reports/page.tsx)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/financial/summary` | GET | ❌ Missing |
| `/financial/profit-loss` | GET | ❌ Missing |
| `/financial/aged-receivables` | GET | ❌ Missing |
| `/financial/reports/generate` | POST | ❌ Missing |
| `/financial/reports/export` | POST | ❌ Missing |

#### Required: Financial Summary Endpoint
```typescript
GET /api/financial/summary?dateFrom={date}&dateTo={date}

Query Parameters:
- dateFrom: ISO date string
- dateTo: ISO date string
- period?: 'current-month' | 'current-quarter' | 'current-year' | 'last-month' | 'last-year'

Response:
{
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  revenueByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  periodComparison: {
    previousPeriod: number;
    currentPeriod: number;
    percentageChange: number;
  };
}
```

#### Required: Profit & Loss Statement Endpoint
```typescript
GET /api/financial/profit-loss?dateFrom={date}&dateTo={date}

Response:
{
  revenue: {
    total: number;
    breakdown: {
      productSales: number;
      serviceRevenue: number;
      otherIncome: number;
    };
  };
  expenses: {
    total: number;
    breakdown: {
      costOfGoods: number;
      operatingExpenses: number;
      salaries: number;
      utilities: number;
      other: number;
    };
  };
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}
```

#### Required: Aged Receivables Endpoint
```typescript
GET /api/financial/aged-receivables

Response:
{
  summary: {
    current: number;        // 0-30 days
    days30: number;         // 31-60 days
    days60: number;         // 61-90 days
    days90Plus: number;     // 90+ days
    total: number;
  };
  customers: {
    customerId: string;
    customerName: string;
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
    total: number;
  }[];
}
```

#### Required: Export Report Endpoint
```typescript
POST /api/financial/reports/export

Request Body:
{
  reportType: 'profit-loss' | 'aged-receivables' | 'revenue-analysis';
  format: 'pdf' | 'excel' | 'csv';
  dateFrom: string;
  dateTo: string;
  filters?: object;
}

Response:
{
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
}
// OR stream file directly
```

---

### 3. Credit Management System

**Location:** [src/app/dashboard/finance-admin/credit-management/page.tsx](../src/app/dashboard/finance-admin/credit-management/page.tsx)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/credit/customers` | GET | ❌ Missing |
| `/credit/customers/{id}/analysis` | GET | ❌ Missing |
| `/credit/risk-assessment` | GET | ❌ Missing |
| `/credit/customers/{id}/limit` | PATCH | ❌ Missing |

#### Required: Credit Customers List Endpoint
```typescript
GET /api/credit/customers?riskLevel={level}&search={term}

Query Parameters:
- riskLevel?: 'low' | 'medium' | 'high' | 'all'
- search?: string
- page?: number
- limit?: number

Response:
{
  customers: CreditCustomer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreditCustomer {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic' | 'ngo' | 'wholesaler';
  creditLimit: number;
  creditUsed: number;
  currentBalance: number;
  overdueAmount: number;
  lastPayment: string;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
  riskLevel: 'low' | 'medium' | 'high';
  phone: string;
  contactPerson: string;
}
```

#### Required: Credit Analysis Endpoint
```typescript
GET /api/credit/customers/{customerId}/analysis

Response:
{
  customer: CreditCustomer;
  analysis: {
    averagePaymentDays: number;
    onTimePaymentRate: number;
    totalTransactions: number;
    totalRevenue: number;
    outstandingInvoices: number;
    paymentTrend: 'improving' | 'stable' | 'declining';
  };
  paymentHistory: {
    date: string;
    amount: number;
    daysOverdue: number;
  }[];
  recommendations: string[];
}
```

#### Required: Update Credit Limit Endpoint
```typescript
PATCH /api/credit/customers/{customerId}/limit

Request Body:
{
  newLimit: number;
  reason: string;
  approvedBy: string;
}

Response:
{
  success: boolean;
  customer: CreditCustomer;
  message: string;
}
```

---

## 📂 Files Requiring Backend Integration

| File | Current State | Mock Data Lines |
|------|---------------|-----------------|
| `order-approvals/index.tsx` | Full mock data | Lines 53-263 |
| `financial-reports/page.tsx` | Full mock data | Lines 91-400+ |
| `credit-management/page.tsx` | Full mock data | Lines 45-150 |
| `account-overview/page.tsx` | Partial mock | Various |
| `orders-tracking/page.tsx` | Uses orders API | Mostly integrated |

---

## 🎯 Acceptance Criteria

### Order Approvals
- [ ] Finance admin can approve pending orders via API
- [ ] Finance admin can reject orders with required reason
- [ ] Bulk approval works for multiple selected orders
- [ ] Order status updates reflect in real-time
- [ ] Approved orders become visible in warehouse for fulfillment

### Financial Reports
- [ ] Summary endpoint returns real financial data
- [ ] Date range filtering works correctly
- [ ] Profit/Loss statement pulls from actual transactions
- [ ] Export generates downloadable files (PDF/Excel)
- [ ] Aged receivables calculated from real invoice data

### Credit Management
- [ ] Customer list populated from distributor/customer data
- [ ] Risk levels calculated based on payment history
- [ ] Credit utilization shows real order/payment data
- [ ] Credit limit updates persist to database
- [ ] Overdue amounts calculated from unpaid invoices

---

## 🔧 Implementation Notes

### Database Requirements
- Order status enum needs `PENDING_APPROVAL`, `APPROVED`, `REJECTED` values
- Audit trail for approval/rejection actions
- Credit limit and payment history tracking per customer
- Financial summary views or materialized queries

### Business Logic
- Only orders in `PENDING_APPROVAL` can be approved/rejected
- Rejection requires a reason (enforced)
- Credit limit changes should trigger notifications
- Overdue calculations: Current (0-30), 30-60, 60-90, 90+ days

### Security
- All endpoints require authentication
- Only `FINANCE_ADMIN` and `SUPER_ADMIN` roles can access
- Audit log for all financial operations

---

## 📊 Priority Matrix

| Feature | Business Impact | Complexity | Priority |
|---------|----------------|------------|----------|
| Order Approval | 🔴 High | Medium | P0 |
| Order Rejection | 🔴 High | Medium | P0 |
| Bulk Approval | 🟠 Medium | Low | P1 |
| Financial Summary | 🔴 High | High | P0 |
| Aged Receivables | 🟠 Medium | Medium | P1 |
| Report Export | 🟡 Low | Medium | P2 |
| Credit Customers | 🟠 Medium | Medium | P1 |
| Credit Analysis | 🟡 Low | High | P2 |

---

## 📞 Contact

**Frontend Team:** Integration ready, awaiting endpoints  
**Related Docs:** 
- [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md)
- [MISSING_ENDPOINTS.md](../MISSING_ENDPOINTS.md)

---

**Status:** 🚧 Awaiting Backend Implementation  
**ETA Request:** Sprint 1-2 for Critical (P0) items
