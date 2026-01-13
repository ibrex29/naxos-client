import { OrderApprovals } from '@/components/dashboard/finance-admin/order-approvals';

/**
 * Order Approval Page
 * 
 * This page allows finance admins to review and approve sales orders.
 * Features include:
 * - View pending, approved, and rejected orders
 * - Filter orders by status, currency, and search terms
 * - Approve or reject individual orders
 * - Bulk approve multiple orders
 * - View detailed order information including items and customer details
 */
export default function OrderApprovalPage() {
  return <OrderApprovals />;
}
