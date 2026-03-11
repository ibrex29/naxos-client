# NAXOS PHARMACEUTICALS — BACKEND API BACKLOG

**Project:** Naxos Pharmaceuticals Management System  
**Generated:** February 11, 2026  
**Frontend Status:** ~85% complete — UI built, awaiting backend endpoints  
**Backend Status:** ~50% integrated — core CRUD done, business logic endpoints missing  
**Total Missing Endpoints:** 21  

---

## 📌 How To Read This Backlog

- Each item has a **unique ticket ID** (NAX-XXX)
- Items are grouped into **Sprints** by priority and dependency
- Every ticket includes: endpoint spec, request/response contract, related frontend file, and acceptance criteria
- **Status legend:** ❌ Not Started · 🔧 In Progress · ✅ Done

---

## 🏗️ EXISTING WORKING ENDPOINTS (No Action Needed)

These are already implemented and integrated. Listed for reference only.

| Module | Endpoint | Method | Status |
|--------|----------|--------|--------|
| Auth | `/auth/login` | POST | ✅ Working |
| Users | `/users/signup` | POST | ✅ Working |
| Users | `/users` | GET | ✅ Working (paginated) |
| Users | `/users/{id}` | PUT | ✅ Working |
| Users | `/users/{id}/activate` | PATCH | ✅ Working |
| Users | `/users/{id}/deactivate` | PATCH | ✅ Working |
| Users | `/users/staff-summary` | GET | ✅ Working |
| Distributors | `/distributors` | GET/POST | ✅ Working (paginated) |
| Distributors | `/distributors/{id}` | GET/PUT | ✅ Working |
| Manufacturers | `/manufacturers` | GET/POST | ✅ Working (paginated) |
| Manufacturers | `/manufacturers/{id}` | GET/PUT | ✅ Working |
| Inventory | `/inventory` | GET | ✅ Working (paginated + filters) |
| Inventory | `/inventory/overview` | GET | ✅ Working |
| Inventory | `/inventory/batches/expiring` | GET | ✅ Working |
| Inventory | `/inventory/movements/recent` | GET | ✅ Working |
| Shipments | `/shipments` | GET/POST | ✅ Working (paginated) |
| Shipments | `/shipments/{id}/delivery-status` | PATCH | ✅ Working |
| Sales Orders | `/sales-orders` | GET/POST | ✅ Working (paginated + filters) |
| Payments | `/payments` | POST | ✅ Working |

---

# SPRINT 1 — ORDER APPROVAL & FINANCIAL ENGINE

> **Goal:** Unblock the entire Finance Admin dashboard (5 pages, currently 0% functional)  
> **Estimated effort:** 1–2 weeks  
> **Impact:** Unlocks order approval workflow, financial reporting, and credit management  

---

### NAX-101 · Approve Sales Order ⭐ CRITICAL

| Field | Value |
|-------|-------|
| **Priority** | P0 — Blocker |
| **Method** | `PATCH` |
| **Endpoint** | `/sales-orders/{orderId}/approve` |
| **Module** | Sales Orders / Finance |
| **Frontend File** | `src/components/dashboard/finance-admin/order-approvals/index.tsx` |
| **Current State** | ❌ Mock data (lines 53–263). Approve button does nothing. |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "approvedBy": "string (userId)",
  "approvalNotes": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": { /* full SalesOrder object with updated status */ },
  "message": "Order approved successfully"
}
```

**Business Rules:**
- Only orders with status `PENDING_APPROVAL` can be approved
- Status transition: `PENDING_APPROVAL` → `APPROVED`
- Approved orders should become visible in warehouse for fulfillment
- Only `FINANCE_ADMIN` and `SUPER_ADMIN` roles can call this endpoint

**Error Responses:**
- `400` — Order not in PENDING_APPROVAL status
- `403` — Insufficient permissions
- `404` — Order not found

**Acceptance Criteria:**
- [ ] Finance admin can approve a pending order
- [ ] Order status changes to APPROVED in database
- [ ] Audit trail records who approved and when
- [ ] Approved order appears in warehouse fulfillment queue

---

### NAX-102 · Reject Sales Order ⭐ CRITICAL

| Field | Value |
|-------|-------|
| **Priority** | P0 — Blocker |
| **Method** | `PATCH` |
| **Endpoint** | `/sales-orders/{orderId}/reject` |
| **Module** | Sales Orders / Finance |
| **Frontend File** | `src/components/dashboard/finance-admin/order-approvals/index.tsx` |
| **Current State** | ❌ Mock data. Reject button does nothing. |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "rejectedBy": "string (userId)",
  "rejectionReason": "string (REQUIRED)"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": { /* full SalesOrder object with updated status */ },
  "message": "Order rejected"
}
```

**Business Rules:**
- Only orders with status `PENDING_APPROVAL` can be rejected
- `rejectionReason` is **required** — enforce on backend
- Status transition: `PENDING_APPROVAL` → `REJECTED`

**Acceptance Criteria:**
- [ ] Finance admin can reject a pending order with a reason
- [ ] Rejection without a reason returns 400
- [ ] Audit trail records rejection reason, who rejected, and when

---

### NAX-103 · Bulk Approve Orders

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `PATCH` |
| **Endpoint** | `/sales-orders/bulk-approve` |
| **Module** | Sales Orders / Finance |
| **Frontend File** | `src/components/dashboard/finance-admin/order-approvals/index.tsx` |
| **Current State** | ❌ Bulk action UI exists but non-functional |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "orderIds": ["string", "string", "..."],
  "approvedBy": "string (userId)"
}
```

**Response (200):**
```json
{
  "success": true,
  "processed": 5,
  "failed": 0,
  "results": [
    { "orderId": "abc123", "success": true },
    { "orderId": "def456", "success": true },
    { "orderId": "ghi789", "success": false, "error": "Order already approved" }
  ],
  "message": "5 orders approved, 0 failed"
}
```

**Business Rules:**
- Process each order independently — partial success is OK
- Skip orders not in `PENDING_APPROVAL` and report them as failed
- Maximum batch size: 50 orders

**Acceptance Criteria:**
- [ ] Bulk approve processes all valid orders
- [ ] Failed orders are reported individually with reason
- [ ] Partial success returns 200 with mixed results array

---

### NAX-104 · Get Financial Summary ⭐ CRITICAL

| Field | Value |
|-------|-------|
| **Priority** | P0 — Blocker |
| **Method** | `GET` |
| **Endpoint** | `/financial/summary` |
| **Module** | Finance |
| **Frontend Files** | `src/app/dashboard/finance-admin/page.tsx` (account overview), `src/app/dashboard/finance-admin/financial-reports/page.tsx` |
| **Current State** | ❌ Both pages use hardcoded KPI values |
| **Status** | ❌ Not Started |

**Query Parameters:**
```
?dateFrom=2026-01-01&dateTo=2026-01-31
&period=current-month          // optional shortcut: current-month | current-quarter | current-year | last-month | last-year
&currency=NGN                  // optional: NGN | USD
```

**Response (200):**
```json
{
  "totalRevenue": 15750000,
  "totalExpenses": 8200000,
  "grossProfit": 7550000,
  "netProfit": 5100000,
  "profitMargin": 32.4,
  "ordersCount": 342,
  "shipmentsCount": 87,
  "averageOrderValue": 46052,
  "revenueByCategory": [
    { "category": "Antibiotics", "amount": 4500000, "percentage": 28.6 },
    { "category": "Analgesics", "amount": 3200000, "percentage": 20.3 }
  ],
  "periodComparison": {
    "previousPeriod": 14200000,
    "currentPeriod": 15750000,
    "percentageChange": 10.9
  },
  "trendData": [
    { "date": "2026-01-01", "revenue": 520000, "cost": 270000 },
    { "date": "2026-01-02", "revenue": 480000, "cost": 250000 }
  ]
}
```

**Acceptance Criteria:**
- [ ] Returns real aggregated data from sales orders and payments
- [ ] Date range filtering works correctly
- [ ] Period shortcuts (current-month, etc.) calculate correct ranges
- [ ] Period comparison calculates % change from previous equivalent period

---

### NAX-105 · Get Profit & Loss Statement

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `GET` |
| **Endpoint** | `/financial/profit-loss` |
| **Module** | Finance |
| **Frontend File** | `src/app/dashboard/finance-admin/financial-reports/page.tsx` |
| **Current State** | ❌ Static mock data |
| **Status** | ❌ Not Started |

**Query Parameters:**
```
?dateFrom=2026-01-01&dateTo=2026-01-31
```

**Response (200):**
```json
{
  "revenue": {
    "total": 15750000,
    "breakdown": {
      "productSales": 14800000,
      "serviceRevenue": 750000,
      "otherIncome": 200000
    }
  },
  "expenses": {
    "total": 10650000,
    "breakdown": {
      "costOfGoods": 8200000,
      "operatingExpenses": 1200000,
      "salaries": 800000,
      "utilities": 250000,
      "other": 200000
    }
  },
  "grossProfit": 7550000,
  "operatingProfit": 5350000,
  "netProfit": 5100000
}
```

**Acceptance Criteria:**
- [ ] Revenue breakdown pulled from actual sales order data
- [ ] Expense breakdown pulled from actual cost records
- [ ] Gross/operating/net profit correctly calculated

---

### NAX-106 · Get Aged Receivables

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `GET` |
| **Endpoint** | `/financial/aged-receivables` |
| **Module** | Finance |
| **Frontend Files** | `src/app/dashboard/finance-admin/page.tsx`, `src/app/dashboard/finance-admin/credit-management/page.tsx` |
| **Current State** | ❌ No aged receivables data anywhere |
| **Status** | ❌ Not Started |

**Response (200):**
```json
{
  "summary": {
    "current": 2500000,
    "days30": 1800000,
    "days60": 950000,
    "days90Plus": 420000,
    "total": 5670000
  },
  "customers": [
    {
      "customerId": "dist_001",
      "customerName": "Lagos General Hospital",
      "current": 500000,
      "days30": 300000,
      "days60": 0,
      "days90Plus": 0,
      "total": 800000
    }
  ]
}
```

**Business Rules:**
- Current = 0–30 days outstanding
- Aging calculated from invoice date, not order date
- Only unpaid/partially-paid invoices included

**Acceptance Criteria:**
- [ ] Aging buckets calculated from real invoice/payment data
- [ ] Customer-level breakdown available
- [ ] Summary totals match sum of customer amounts

---

### NAX-107 · Get Credit Analysis ⭐ CRITICAL

| Field | Value |
|-------|-------|
| **Priority** | P0 — Blocker |
| **Method** | `GET` |
| **Endpoint** | `/credit/analysis` |
| **Module** | Credit Management |
| **Frontend File** | `src/app/dashboard/finance-admin/credit-management/page.tsx` |
| **Current State** | ❌ Entire page uses hardcoded `creditCustomers` array (lines 45–150) |
| **Status** | ❌ Not Started |

**Query Parameters:**
```
?riskLevel=high                // optional filter: low | medium | high | all
&search=lagos                  // optional text search
&sortField=overdueAmount       // optional: riskLevel | creditUsed | overdueAmount
&sortOrder=desc                // optional: asc | desc
&page=1&limit=20
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "dist_001",
      "name": "Lagos General Hospital",
      "type": "hospital",
      "creditLimit": 5000000,
      "creditUsed": 3200000,
      "creditAvailable": 1800000,
      "overdueAmount": 420000,
      "riskLevel": "medium",
      "riskScore": 55,
      "paymentHistory": "good",
      "lastPayment": "2026-01-28T10:00:00Z",
      "phone": "+234-801-234-5678",
      "contactPerson": "Dr. Adeyemi",
      "agedReceivables": {
        "current": 500000,
        "30days": 300000,
        "60days": 120000,
        "90days": 0,
        "90plus": 0
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Business Rules:**
- Risk score (0–100) calculated from: payment history, overdue amount, credit utilization
- Risk level derived from score: 0–33 = low, 34–66 = medium, 67–100 = high
- Customer `type` enum: `hospital`, `pharmacy`, `clinic`, `ngo`, `wholesaler`

**Acceptance Criteria:**
- [ ] Returns real customer/distributor data with credit info
- [ ] Risk level calculated automatically from payment history
- [ ] Pagination and filtering work correctly
- [ ] Aged receivables per customer are accurate

---

### NAX-108 · Update Credit Limit

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `PATCH` |
| **Endpoint** | `/credit/{customerId}/limit` |
| **Module** | Credit Management |
| **Frontend File** | `src/app/dashboard/finance-admin/credit-management/page.tsx` |
| **Current State** | ❌ UI allows editing but change doesn't persist |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "newLimit": 7500000,
  "reason": "Good payment history over 6 months",
  "updatedBy": "string (userId)"
}
```

**Response (200):**
```json
{
  "success": true,
  "customer": { /* updated customer object */ },
  "previousLimit": 5000000,
  "newLimit": 7500000,
  "message": "Credit limit updated successfully"
}
```

**Acceptance Criteria:**
- [ ] Credit limit persists to database
- [ ] Audit trail records old limit, new limit, reason, and who changed it
- [ ] Updated limit immediately reflected in credit analysis queries

---

### NAX-109 · Get Customer Risk Assessment

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `GET` |
| **Endpoint** | `/credit/{customerId}/risk-assessment` |
| **Module** | Credit Management |
| **Frontend File** | `src/app/dashboard/finance-admin/credit-management/page.tsx` |
| **Current State** | ❌ No detail view data |
| **Status** | ❌ Not Started |

**Response (200):**
```json
{
  "riskLevel": "medium",
  "riskScore": 55,
  "riskFactors": [
    "2 invoices overdue by 30+ days",
    "Credit utilization at 64%"
  ],
  "recommendations": [
    "Consider reducing credit limit",
    "Require advance payment for next order"
  ],
  "lastReviewDate": "2026-01-15T10:00:00Z",
  "paymentHistory": [
    { "date": "2026-01-28", "amount": 250000, "daysOverdue": 0 },
    { "date": "2026-01-05", "amount": 180000, "daysOverdue": 12 }
  ]
}
```

**Acceptance Criteria:**
- [ ] Risk factors generated from actual data patterns
- [ ] Recommendations are rule-based (configurable thresholds)

---

## 🔢 SPRINT 1 SUMMARY

| Ticket | Endpoint | Priority | Est. Effort |
|--------|----------|----------|-------------|
| NAX-101 | `PATCH /sales-orders/{id}/approve` | P0 | 3–4 hrs |
| NAX-102 | `PATCH /sales-orders/{id}/reject` | P0 | 2–3 hrs |
| NAX-103 | `PATCH /sales-orders/bulk-approve` | P1 | 3–4 hrs |
| NAX-104 | `GET /financial/summary` | P0 | 6–8 hrs |
| NAX-105 | `GET /financial/profit-loss` | P1 | 4–6 hrs |
| NAX-106 | `GET /financial/aged-receivables` | P1 | 4–6 hrs |
| NAX-107 | `GET /credit/analysis` | P0 | 6–8 hrs |
| NAX-108 | `PATCH /credit/{id}/limit` | P1 | 2–3 hrs |
| NAX-109 | `GET /credit/{id}/risk-assessment` | P2 | 3–4 hrs |

**Total Sprint 1:** ~33–46 hours · **9 endpoints** · Unblocks **5 Finance Admin pages**

---

# SPRINT 2 — AUTH, INVENTORY WRITES & POS

> **Goal:** Complete Warehouse Admin, fix Settings, make POS functional  
> **Estimated effort:** 1–2 weeks  
> **Impact:** Completes 2 more dashboards  

---

### NAX-201 · Change Password

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `POST` |
| **Endpoint** | `/users/{userId}/change-password` |
| **Module** | Auth / User Management |
| **Frontend File** | `src/components/dashboard/admin/settings/index.tsx` (line 24: `// TODO: integrate API call here`) |
| **Current State** | ❌ Form exists, submit does nothing |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` — Current password incorrect / passwords don't match
- `400` — New password doesn't meet complexity requirements

**Acceptance Criteria:**
- [ ] Validates current password before allowing change
- [ ] Enforces password complexity (min 8 chars, uppercase, number)
- [ ] Returns clear error message if current password is wrong

---

### NAX-202 · Password Reset Flow

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/auth/password-reset` |
| **Module** | Auth |
| **Frontend File** | None yet (UI needs to be built) |
| **Current State** | ❌ No reset flow exists |
| **Status** | ❌ Not Started |

**Step 1 — Request Reset:**
```json
POST /auth/password-reset
{ "email": "user@example.com" }

Response: { "message": "Reset link sent to email", "resetToken": "abc123..." }
```

**Step 2 — Complete Reset:**
```json
POST /auth/password-reset
{ "resetToken": "abc123...", "newPassword": "NewPass123!" }

Response: { "success": true, "message": "Password reset successfully" }
```

**Acceptance Criteria:**
- [ ] Sends reset email/token
- [ ] Token expires after 1 hour
- [ ] Token is single-use

---

### NAX-203 · Adjust Stock

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `PATCH` |
| **Endpoint** | `/inventory/{medicineId}/adjust-stock` |
| **Module** | Inventory |
| **Frontend Files** | `src/components/dashboard/admin/stocks/index.tsx`, `src/components/dashboard/warehouse/stocks/index.tsx` |
| **Current State** | ❌ Stock pages are read-only |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "quantity": -50,
  "reason": "damage",
  "batchNumber": "BATCH-2026-001",
  "notes": "Water damage in storage area B",
  "adjustedBy": "string (userId)"
}
```

**Reason enum:** `damage` | `expiry` | `recount` | `sale` | `return` | `correction`

**Response (200):**
```json
{
  "success": true,
  "previousQuantity": 500,
  "newQuantity": 450,
  "adjustment": {
    "id": "adj_001",
    "medicineId": "med_001",
    "quantity": -50,
    "reason": "damage",
    "notes": "Water damage in storage area B",
    "adjustedBy": "user_001",
    "createdAt": "2026-02-11T10:00:00Z"
  }
}
```

**Business Rules:**
- Positive quantity = stock increase, negative = decrease
- Cannot reduce below 0
- All adjustments must have a reason

**Acceptance Criteria:**
- [ ] Stock quantity updated in database
- [ ] Adjustment logged in inventory movements
- [ ] Rejects adjustment that would bring stock below 0

---

### NAX-204 · Mark Batch as Expired

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `PATCH` |
| **Endpoint** | `/inventory/{medicineId}/batches/{batchId}/mark-expired` |
| **Module** | Inventory |
| **Frontend File** | `src/app/dashboard/warehouse-admin/inventory/page.tsx` |
| **Current State** | ❌ Expiring batches list shows data but no action button works |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "reason": "Past expiry date",
  "markedBy": "string (userId)"
}
```

**Response (200):**
```json
{
  "success": true,
  "batch": { /* updated batch with status=EXPIRED */ }
}
```

**Business Rules:**
- Sets batch status to `EXPIRED`
- Removes batch quantity from available stock
- Creates inventory movement record for audit

**Acceptance Criteria:**
- [ ] Batch status changes to EXPIRED
- [ ] Available stock quantity decremented
- [ ] Audit trail created

---

### NAX-205 · Barcode Scan Lookup

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/inventory/scan-barcode` |
| **Module** | Inventory |
| **Frontend File** | `src/components/shared/barcode-scanner/` |
| **Current State** | ❌ Scanner UI component exists but returns nothing |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "barcode": "5901234123457",
  "action": "lookup"
}
```

**Action enum:** `receive` | `verify` | `lookup`

**Response (200):**
```json
{
  "success": true,
  "medicine": {
    "id": "med_001",
    "name": "Amoxicillin 500mg",
    "batchNumber": "BATCH-2026-001",
    "expiryDate": "2027-06-15",
    "quantity": 450,
    "manufacturer": "GSK Nigeria",
    "status": "IN_STOCK"
  }
}
```

**Acceptance Criteria:**
- [ ] Looks up medicine by barcode/SKU
- [ ] Returns full product info for display
- [ ] Returns 404 if barcode not found

---

### NAX-206 · Verify POS Order Submission

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `POST` |
| **Endpoint** | `/sales-orders` (existing — verify it supports POS use-case) |
| **Module** | Sales |
| **Frontend File** | `src/components/dashboard/sales/index.tsx` |
| **Current State** | ❌ POS uses `mockMedicines` and `mockCustomers`. `handlePayment` does `console.log` only. |
| **Status** | ❌ Not Started |

**Notes for backend dev:**
The `POST /sales-orders` endpoint exists for the Create Order page, but the POS page needs:
1. Ability to create walk-in/cash orders (no distributor required, or a default "Walk-In" distributor)
2. Support for `paymentMethod: 'cash' | 'card' | 'transfer'` with immediate payment
3. Response should include an `invoiceNumber` or `receiptNumber` for printing

**Acceptance Criteria:**
- [ ] POS can submit an order without selecting a distributor
- [ ] Immediate payment recorded with the order
- [ ] Response includes receipt/invoice number

---

## 🔢 SPRINT 2 SUMMARY

| Ticket | Endpoint | Priority | Est. Effort |
|--------|----------|----------|-------------|
| NAX-201 | `POST /users/{id}/change-password` | P1 | 2–3 hrs |
| NAX-202 | `POST /auth/password-reset` | P2 | 4–6 hrs |
| NAX-203 | `PATCH /inventory/{id}/adjust-stock` | P1 | 4–5 hrs |
| NAX-204 | `PATCH /inventory/{id}/batches/{bId}/mark-expired` | P1 | 2–3 hrs |
| NAX-205 | `POST /inventory/scan-barcode` | P2 | 3–4 hrs |
| NAX-206 | Verify `POST /sales-orders` for POS | P1 | 2–3 hrs |

**Total Sprint 2:** ~17–24 hours · **6 endpoints** · Completes **Warehouse Admin + Sales Admin + Settings**

---

# SPRINT 3 — EXPORT, ANALYTICS & DOCUMENTS

> **Goal:** Add export functionality, distributor analytics, and document management  
> **Estimated effort:** 1–2 weeks  
> **Impact:** Polishes all dashboards to 95%+  

---

### NAX-301 · Generate Financial Report

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Method** | `POST` |
| **Endpoint** | `/financial/reports/generate` |
| **Module** | Finance |
| **Frontend File** | `src/app/dashboard/finance-admin/financial-reports/page.tsx` |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "reportType": "monthly",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31",
  "includeDetails": true
}
```

**Report type enum:** `daily` | `weekly` | `monthly` | `yearly` | `custom`

**Response (200):**
```json
{
  "reportId": "rpt_001",
  "generatedAt": "2026-02-11T10:00:00Z",
  "data": {
    "summary": { /* same as /financial/summary response */ },
    "details": {
      "sales": [{ "orderId": "...", "amount": 500000, "date": "..." }],
      "payments": [{ "paymentId": "...", "amount": 500000, "method": "transfer" }],
      "receivables": [{ "customerId": "...", "outstanding": 200000 }]
    }
  }
}
```

---

### NAX-302 · Export Report (PDF/CSV/XLSX)

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/financial/reports/export` |
| **Module** | Finance / Export |
| **Frontend File** | `src/app/dashboard/finance-admin/financial-reports/page.tsx` |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "reportType": "profit-loss",
  "format": "pdf",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31"
}
```

**Format enum:** `pdf` | `csv` | `xlsx`

**Response:** File binary stream with appropriate `Content-Type` and `Content-Disposition` headers

---

### NAX-303 · Export Orders

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/export/orders` |
| **Module** | Export |
| **Frontend Files** | Multiple order list pages |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "format": "csv",
  "filters": {
    "status": "APPROVED",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-01-31"
  }
}
```

**Response:** File binary stream

---

### NAX-304 · Export Inventory

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/export/inventory` |
| **Module** | Export |
| **Frontend Files** | Stock management pages |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "format": "xlsx",
  "filters": {
    "form": "tablet",
    "stockStatus": "low"
  }
}
```

---

### NAX-305 · Export Shipments

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/export/shipments` |
| **Module** | Export |
| **Status** | ❌ Not Started |

**Request:**
```json
{
  "format": "pdf",
  "filters": {
    "status": "DELIVERED",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-01-31"
  }
}
```

---

### NAX-306 · Get Distributor Order History

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `GET` |
| **Endpoint** | `/distributors/{distributorId}/orders` |
| **Module** | Distributors |
| **Frontend File** | `src/app/dashboard/super-admin/distributors/page.tsx` (line 427: "Coming Soon") |
| **Status** | ❌ Not Started |

**Query Parameters:**
```
?status=delivered&from=2026-01-01&to=2026-01-31&page=1&limit=20
```

**Response (200):**
```json
{
  "data": [
    {
      "orderId": "ord_001",
      "orderDate": "2026-01-15T10:00:00Z",
      "status": "DELIVERED",
      "totalAmount": 750000,
      "itemCount": 12,
      "paymentStatus": "PAID"
    }
  ],
  "meta": { "total": 28, "page": 1, "limit": 20, "totalPages": 2 }
}
```

---

### NAX-307 · Get Distributor Analytics

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `GET` |
| **Endpoint** | `/distributors/{distributorId}/analytics` |
| **Module** | Distributors |
| **Frontend File** | `src/app/dashboard/super-admin/distributors/page.tsx` (line 434: "Coming Soon") |
| **Status** | ❌ Not Started |

**Response (200):**
```json
{
  "totalPurchases": 85,
  "totalSpent": 12500000,
  "averageOrderValue": 147058,
  "lastOrderDate": "2026-02-08T14:30:00Z",
  "orderFrequency": { "30days": 4, "60days": 9, "90days": 15 },
  "topProducts": [
    { "medicineId": "med_001", "medicineName": "Amoxicillin 500mg", "totalQuantity": 2400, "totalSpent": 3600000 }
  ]
}
```

---

### NAX-308 · Upload Shipment Documents

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Method** | `POST` |
| **Endpoint** | `/shipments/{shipmentId}/documents` |
| **Module** | Shipments |
| **Frontend File** | `src/app/dashboard/warehouse-admin/shipments/page.tsx` |
| **Current State** | ⚠️ File inputs exist for invoice, quality check, packing list, insurance — upload handling unclear |
| **Status** | ❌ Not Started |

**Request:** `Content-Type: multipart/form-data`
```
documents: File[]
documentType: "invoice" | "quality-check" | "packing-list" | "insurance"
uploadedBy: string
```

**Response (200):**
```json
{
  "success": true,
  "documents": [
    { "id": "doc_001", "fileName": "invoice.pdf", "type": "invoice", "url": "https://...", "uploadedAt": "2026-02-11T10:00:00Z" }
  ]
}
```

---

## 🔢 SPRINT 3 SUMMARY

| Ticket | Endpoint | Priority | Est. Effort |
|--------|----------|----------|-------------|
| NAX-301 | `POST /financial/reports/generate` | P1 | 4–6 hrs |
| NAX-302 | `POST /financial/reports/export` | P2 | 4–6 hrs |
| NAX-303 | `POST /export/orders` | P2 | 2–3 hrs |
| NAX-304 | `POST /export/inventory` | P2 | 2–3 hrs |
| NAX-305 | `POST /export/shipments` | P2 | 2–3 hrs |
| NAX-306 | `GET /distributors/{id}/orders` | P2 | 3–4 hrs |
| NAX-307 | `GET /distributors/{id}/analytics` | P2 | 4–6 hrs |
| NAX-308 | `POST /shipments/{id}/documents` | P2 | 3–4 hrs |

**Total Sprint 3:** ~24–35 hours · **8 endpoints** · Adds **export, analytics & documents**

---

# SPRINT 4 — SYSTEM SETTINGS & POLISH

> **Goal:** Final configuration endpoints and cleanup  
> **Estimated effort:** 3–5 days  

---

### NAX-401 · Get System Settings

| Field | Value |
|-------|-------|
| **Priority** | P3 — Low |
| **Method** | `GET` |
| **Endpoint** | `/settings/system` |
| **Module** | Admin |
| **Status** | ❌ Not Started |

**Response (200):**
```json
{
  "company": { "name": "Naxos Pharmaceuticals", "logo": "url", "email": "info@naxos.com", "phone": "+234...", "address": "Lagos, Nigeria" },
  "business": { "currency": "NGN", "taxRate": 7.5, "discountPolicy": "volume-based" },
  "inventory": { "lowStockThreshold": 50, "expiryWarningDays": 90 }
}
```

---

### NAX-402 · Update System Settings

| Field | Value |
|-------|-------|
| **Priority** | P3 — Low |
| **Method** | `POST` |
| **Endpoint** | `/settings/system` |
| **Module** | Admin |
| **Status** | ❌ Not Started |

**Request:** Partial update of any settings section (same shape as GET response)

---

## 🔢 SPRINT 4 SUMMARY

| Ticket | Endpoint | Priority | Est. Effort |
|--------|----------|----------|-------------|
| NAX-401 | `GET /settings/system` | P3 | 2–3 hrs |
| NAX-402 | `POST /settings/system` | P3 | 2–3 hrs |

**Total Sprint 4:** ~4–6 hours · **2 endpoints**

---

# 📊 FULL BACKLOG SUMMARY

| Sprint | Tickets | Endpoints | Est. Hours | Unlocks |
|--------|:-------:|:---------:|:----------:|---------|
| **Sprint 1** | NAX-101 → NAX-109 | 9 | 33–46 hrs | Finance Admin (5 pages) |
| **Sprint 2** | NAX-201 → NAX-206 | 6 | 17–24 hrs | Warehouse + Sales + Settings |
| **Sprint 3** | NAX-301 → NAX-308 | 8 | 24–35 hrs | Export + Analytics + Documents |
| **Sprint 4** | NAX-401 → NAX-402 | 2 | 4–6 hrs | System config |
| **TOTAL** | **25 tickets** | **25 endpoints** | **78–111 hrs** | **Full project completion** |

---

## 🗄️ DATABASE PREREQUISITES

> **⚠️ These must be done before Sprint 1 coding begins:**

1. **Order status enum** — Add values: `PENDING_APPROVAL`, `APPROVED`, `REJECTED`
2. **Audit trail table** — For approval/rejection/credit change actions:
   ```
   audit_log: { id, action, entity_type, entity_id, performed_by, details (JSON), created_at }
   ```
3. **Credit tracking** — Per-distributor credit fields or separate credit table:
   ```
   credit_profile: { customer_id, credit_limit, credit_used, risk_score, risk_level, last_reviewed }
   ```
4. **Financial views** — Materialized queries or views for revenue/expense aggregation
5. **File storage** — S3 bucket or equivalent for document uploads (Sprint 3)

---

## 🔐 SECURITY REQUIREMENTS (All Endpoints)

| Requirement | Details |
|-------------|---------|
| **Authentication** | All endpoints require valid JWT Bearer token |
| **Authorization** | Role-based: `SUPER_ADMIN` has full access; `FINANCE_ADMIN` for financial/credit/approval endpoints; `WAREHOUSE_ADMIN` for inventory/shipment endpoints; `SALES_ADMIN` for sales order endpoints |
| **Audit Logging** | All write operations must create audit trail entry |
| **Input Validation** | All request bodies validated; reject malformed input with 400 |
| **Rate Limiting** | Export endpoints should have rate limiting (prevent abuse) |

---

## 📞 FRONTEND TEAM NOTES

Once backend endpoints are delivered, the frontend team will:

1. **Sprint 1 delivery →** Create `financialService.ts`, `use-financial.ts` hook, replace all mock data in Finance Admin pages
2. **Sprint 2 delivery →** Wire up Settings password change, add stock adjustment modals, connect POS to real API
3. **Sprint 3 delivery →** Implement download handlers for exports, replace "Coming Soon" placeholders, add document upload progress UI
4. **Sprint 4 delivery →** Build system settings admin page

**Estimated frontend integration time per sprint:** 2–3 days after endpoints are available and tested.

---

*Generated from project analysis on February 11, 2026*  
*Source files: MISSING_ENDPOINTS.md, PROJECT_COMPLETION_ANALYSIS.md, ISSUE_001_FINANCE_ADMIN_BACKEND.md*
