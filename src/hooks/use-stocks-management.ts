import { useQuery } from '@tanstack/react-query';
import { InventoryQueryParams, InventoryResponse, RecentMovement, fetchInventory, fetchInventoryOverview, fetchExpiringBatches, fetchRecentMovements } from '@/app/api/service/stockService';
import { ExpiringBatch, InventoryOverview } from '@/types/inventory';

// Query: Get inventory with pagination and filters
export const useInventory = (params: InventoryQueryParams = {}) => {
  return useQuery<InventoryResponse, Error>({
    queryKey: ['inventory', params],
    queryFn: () => fetchInventory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // For smooth pagination
  });
};

// Query: Get inventory overview
export const useInventoryOverview = () => {
  return useQuery<InventoryOverview, Error>({
    queryKey: ['inventoryOverview'],
    queryFn: fetchInventoryOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Query: Get expiring batches
export const useExpiringBatches = () => {
  return useQuery<ExpiringBatch[], Error>({
    queryKey: ['expiringBatches'],
    queryFn: fetchExpiringBatches,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Query: Get recent movements
export const useRecentMovements = () => {
  return useQuery<RecentMovement[], Error>({
    queryKey: ['recentMovements'],
    queryFn: fetchRecentMovements,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Custom hook for stock management
export const useStockManagement = (params: InventoryQueryParams = {}) => {
  const inventoryQuery = useInventory(params);
  const overviewQuery = useInventoryOverview();
  const expiringBatchesQuery = useExpiringBatches();
  const recentMovementsQuery = useRecentMovements();

  return {
    inventory: inventoryQuery.data,
    isLoadingInventory: inventoryQuery.isLoading,
    inventoryError: inventoryQuery.error,
    overview: overviewQuery.data,
    isLoadingOverview: overviewQuery.isLoading,
    overviewError: overviewQuery.error,
    expiringBatches: expiringBatchesQuery.data,
    isLoadingExpiringBatches: expiringBatchesQuery.isLoading,
    expiringBatchesError: expiringBatchesQuery.error,
    recentMovements: recentMovementsQuery.data,
    isLoadingRecentMovements: recentMovementsQuery.isLoading,
    recentMovementsError: recentMovementsQuery.error,
  };
};