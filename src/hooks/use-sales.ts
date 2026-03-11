'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BulkApproveSalesOrdersPayload,
  RejectSalesOrderPayload,
  SalesOrderQueryParams,
  SalesOrderResponse,
  approveSalesOrder,
  bulkApproveSalesOrders,
  createPayment,
  createSalesOrder,
  fetchSalesOrders,
  rejectSalesOrder,
} from '@/app/api/service/salesService';

// Query: Get sales orders with pagination and filters
export const useSalesOrders = (params: SalesOrderQueryParams = {}) => {
  return useQuery<SalesOrderResponse, Error>({
    queryKey: ['salesOrders', params],
    queryFn: () => fetchSalesOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // For smooth pagination
  });
};

// Mutation: Create sales order
export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalesOrder,
    onSuccess: () => {
      // Invalidate and refetch sales orders list and inventory
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error) => {
      console.error('Error creating sales order:', error);
    },
  });
};

// Mutation: Create payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
    },
  });
};

// Mutation: Approve a pending sales order
export const useApproveSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
    onError: (error) => {
      console.error('Error approving sales order:', error);
    },
  });
};

// Mutation: Reject a pending sales order
export const useRejectSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RejectSalesOrderPayload) => rejectSalesOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
    onError: (error) => {
      console.error('Error rejecting sales order:', error);
    },
  });
};

// Mutation: Bulk approve pending sales orders
export const useBulkApproveSalesOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkApproveSalesOrdersPayload) => bulkApproveSalesOrders(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
    onError: (error) => {
      console.error('Error bulk approving sales orders:', error);
    },
  });
};

// Custom hook for sales management
export const useSalesManagement = (params: SalesOrderQueryParams = {}) => {
  const salesOrdersQuery = useSalesOrders(params);
  const createSalesOrderMutation = useCreateSalesOrder();
  const createPaymentMutation = useCreatePayment();

  return {
    salesOrders: salesOrdersQuery.data,
    isLoadingSalesOrders: salesOrdersQuery.isLoading,
    salesOrdersError: salesOrdersQuery.error,
    createSalesOrder: createSalesOrderMutation,
    createPayment: createPaymentMutation,
    refetchSalesOrders: salesOrdersQuery.refetch, 
  };
};