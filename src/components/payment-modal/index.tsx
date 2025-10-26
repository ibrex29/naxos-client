'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Receipt
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SalesOrder, CreatePaymentPayload, PaymentResponse, PaymentStatus, PaymentType } from '@/app/api/service/salesService';
import { UseMutationResult } from '@tanstack/react-query';
import FileUpload from '@/components/file-upload';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: SalesOrder;
  onPaymentSuccess: (updatedOrder: SalesOrder) => void;
  createPayment: UseMutationResult<PaymentResponse, Error, CreatePaymentPayload>;
}

export function PaymentModal({ open, onClose, order, onPaymentSuccess, createPayment }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number>(order.amountRemaining);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<Array<{ url: string; fileName: string }>>([]);

  // Reset form data when modal is closed
  useEffect(() => {
    if (!open) {
      setPaymentAmount(order.amountRemaining);
      setPaymentType(PaymentType.CASH);
      setNotes('');
      setDocuments([]);
    }
  }, [open, order.amountRemaining]);

  const handleSubmitPayment = async () => {
    if (paymentAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Payment amount must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    if (paymentAmount > order.amountRemaining) {
      toast({
        title: 'Invalid Amount',
        description: 'Payment amount cannot exceed remaining balance',
        variant: 'destructive'
      });
      return;
    }

    if (documents.length === 0) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload at least one payment document/receipt',
        variant: 'destructive'
      });
      return;
    }

    try {
      const paymentData: CreatePaymentPayload = {
        amount: paymentAmount,
        currency: order.currency,
        type: paymentType,
        salesOrderId: order.id,
        documents
      };
      // Call the createPayment mutation
      const paymentResponse = await createPayment.mutateAsync(paymentData);

      // Create updated order object
      const newAmountPaid = order.amountPaid + paymentResponse.amount;
      const newAmountRemaining = order.orderAmount - newAmountPaid;
      
      let newPaymentStatus: PaymentStatus;
      if (newAmountRemaining <= 0) {
        newPaymentStatus = PaymentStatus.PAID;
      } else if (newAmountPaid > 0) {
        newPaymentStatus = PaymentStatus.PARTIAL;
      } else {
        newPaymentStatus = PaymentStatus.PENDING;
      }

      const updatedOrder: SalesOrder = {
        ...order,
        amountPaid: newAmountPaid,
        amountRemaining: Math.max(0, newAmountRemaining),
        paymentStatus: newPaymentStatus,
        payments: [
          ...order.payments,
          {
            id: paymentResponse.id,
            amount: paymentResponse.amount,
            currency: paymentResponse.currency,
            type: paymentResponse.type,
            entityType: paymentResponse.entityType,
            entityId: paymentResponse.entityId,
            distributorId: paymentResponse.distributorId,
            salesOrderId: paymentResponse.salesOrderId,
            createdAt: paymentResponse.createdAt,
            Document: paymentResponse.Document
          }
        ]
      };

      onPaymentSuccess(updatedOrder);
      toast({
        title: 'Payment Success',
        description: 'Payment recorded successfully!',
        variant: 'default'
      });

      // Reset form (already handled by useEffect when modal closes)
      
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment',
        variant: 'destructive'
      });
      console.error('Payment error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: order.currency
    }).format(amount);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case PaymentType.CASH:
        return 'Cash Payment';
      case PaymentType.BANK_TRANSFER:
        return 'Bank Transfer';
      case PaymentType.CREDIT:
        return 'Credit Payment';
      default:
        return type;
    }
  };

  const isFullPayment = paymentAmount === order.amountRemaining;
  const isValidAmount = paymentAmount > 0 && paymentAmount <= order.amountRemaining;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Customer:</div>
                <div className="font-medium">{order.distributor.name}</div>
                <div className="text-xs text-muted-foreground">
                  {order.distributor.code} - {order.distributor.type}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Order ID:</div>
                <div className="font-medium">#{order.id.slice(0, 8)}...</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Amount:</div>
                <div className="font-medium">{formatCurrency(order.orderAmount)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Already Paid:</div>
                <div className="font-medium text-success">{formatCurrency(order.amountPaid)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Remaining Balance:</div>
                <div className="font-medium text-destructive">{formatCurrency(order.amountRemaining)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Payment Status:</div>
                <div>
                  <Badge className={
                    order.paymentStatus === PaymentStatus.PAID ? 'bg-success text-success-foreground' :
                    order.paymentStatus === PaymentStatus.PARTIAL ? 'bg-warning text-warning-foreground' :
                    'bg-destructive text-destructive-foreground'
                  }>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-2">Order Items</h4>
            <div className="border rounded-lg">
              {order.items.map((item, index) => (
                <div key={index} className={`p-3 ${index !== order.items.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.medicine.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.medicine.strength} {item.medicine.form}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{item.quantity} units × {formatCurrency(item.unitPrice)}</div>
                      <div className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <h4 className="font-semibold">Payment Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Payment Amount ({order.currency})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    max={order.amountRemaining}
                    min={0}
                    step="0.01"
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(order.amountRemaining)}
                  >
                    Full Payment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(order.amountRemaining / 2)}
                  >
                    50%
                  </Button>
                </div>
                
                {!isValidAmount && paymentAmount > 0 && (
                  <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Amount exceeds remaining balance
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="type">Payment Method</Label>
                <Select value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentType.CASH}>💵 Cash Payment</SelectItem>
                    <SelectItem value={PaymentType.BANK_TRANSFER}>🏦 Bank Transfer</SelectItem>
                    <SelectItem value={PaymentType.CREDIT}>💳 Credit Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Payment Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this payment..."
                rows={3}
              />
            </div>

            {/* Document Upload */}
            <div>
              <Label>Payment Documents/Receipts *</Label>
              <FileUpload
                onFilesChange={setDocuments}
                acceptedTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                label="Upload payment receipts, bank transfer confirmations, or other payment documents"
              />
            </div>

            {/* Payment Summary */}
            {isValidAmount && (
              <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">Payment Summary</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span className="font-medium">{formatCurrency(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium">{getPaymentTypeLabel(paymentType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Balance:</span>
                    <span className="font-medium">
                      {formatCurrency(order.amountRemaining - paymentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span>New Status:</span>
                    <Badge className={isFullPayment ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                      {isFullPayment ? PaymentStatus.PAID : PaymentStatus.PARTIAL}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Previous Payments */}
          {order.payments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Previous Payments</h4>
              <div className="space-y-2">
                {order.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between border rounded p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      <span>{getPaymentTypeLabel(payment.type)}</span>
                      <span className="text-muted-foreground">
                        on {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-medium text-success">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={createPayment.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={!isValidAmount || documents.length === 0 || createPayment.isPending}
              className="flex-1"
            >
              {createPayment.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Payment of {formatCurrency(paymentAmount)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}