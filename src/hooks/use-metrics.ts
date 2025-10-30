// src/hooks/use-warehouse-metrics.ts
import { useQuery } from '@tanstack/react-query';
import {
  fetchInventoryOverview,
  fetchRecentMovements,
  fetchFifoQueue,
  fetchExpiringBatches,
  RecentMovement,
  FifoItem,
  
} from '@/app/api/service/stockService';
import { ExpiringBatch, InventoryOverview } from '@/types/inventory';

/* -------------------------------------------------------------
   Types returned by the combined hook
   ------------------------------------------------------------- */


export interface WarehouseMetrics {
  overview: InventoryOverview | undefined;
  recentMovements: RecentMovement[];
  fifoQueue: FifoItem[];
  expiringBatches: ExpiringBatch[];

  // loading flags
  isLoadingOverview: boolean;
  isLoadingMovements: boolean;
  isLoadingFifo: boolean;
  isLoadingExpiring: boolean;

  // error objects (null when no error)
  errorOverview: Error | null;
  errorMovements: Error | null;
  errorFifo: Error | null;
  errorExpiring: Error | null;
}

/* -------------------------------------------------------------
   The combined hook
   ------------------------------------------------------------- */
export const useWarehouseMetrics = (): WarehouseMetrics => {
  const overviewQuery = useQuery<InventoryOverview>({
    queryKey: ['inventory-overview'],
    queryFn: fetchInventoryOverview,
  });

  const movementsQuery = useQuery<RecentMovement[]>({
    queryKey: ['recent-movements'],
    queryFn: fetchRecentMovements,
  });

  const fifoQuery = useQuery<FifoItem[]>({
    queryKey: ['fifo-queue'],
    queryFn: fetchFifoQueue,
  });

  const expiringQuery = useQuery<ExpiringBatch[]>({
    queryKey: ['expiring-batches'],
    queryFn: fetchExpiringBatches,
  });

  return {
    overview: overviewQuery.data,
    recentMovements: movementsQuery.data ?? [],
    fifoQueue: fifoQuery.data ?? [],
    expiringBatches: expiringQuery.data ?? [],

    isLoadingOverview: overviewQuery.isLoading,
    isLoadingMovements: movementsQuery.isLoading,
    isLoadingFifo: fifoQuery.isLoading,
    isLoadingExpiring: expiringQuery.isLoading,

    errorOverview: overviewQuery.error as Error | null,
    errorMovements: movementsQuery.error as Error | null,
    errorFifo: fifoQuery.error as Error | null,
    errorExpiring: expiringQuery.error as Error | null,
  };
};