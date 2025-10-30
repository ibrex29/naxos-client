/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InventoryItem, InventoryOverview, ExpiringBatch } from '@/types/inventory';
import authApi from '@/utils/authApi';

// Interface for query parameters used in fetching inventory
export interface InventoryQueryParams {
  search?: string;
  form?: string;
  inStockOnly?: boolean;
  expiryBefore?: string;
  expiryAfter?: string;
  createdBefore?: string;
  createdAfter?: string;
  minPrice?: number;
  maxPrice?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FifoItem extends ExpiringBatch { }

// Interface for recent movements
export interface RecentMovement {
  medicine: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  createdAt: string;
}

// Interface for paginated inventory response
export interface InventoryResponse {
  data: InventoryItem[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Fetch inventory with pagination and filters
export const fetchInventory = async (params: InventoryQueryParams = {}): Promise<InventoryResponse> => {
  const {
    search = '',
    form = '',
    inStockOnly,
    expiryBefore,
    expiryAfter,
    createdBefore,
    createdAfter,
    minPrice,
    maxPrice,
    sortField = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  } = params;

  const queryParams = new URLSearchParams({
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
    sortField,
    ...(search && { search }),
    ...(form && { form }),
    ...(inStockOnly !== undefined && { inStockOnly: inStockOnly.toString() }),
    ...(expiryBefore && { expiryBefore }),
    ...(expiryAfter && { expiryAfter }),
    ...(createdBefore && { createdBefore }),
    ...(createdAfter && { createdAfter }),
    ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
    ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
  });

  const { data } = await authApi.get(`/inventory?${queryParams.toString()}`);
  return data;
};

// Fetch inventory overview
export const fetchInventoryOverview = async (): Promise<InventoryOverview> => {
  const { data } = await authApi.get('/inventory/overview');
  return data;
};

// Fetch expiring batches
export const fetchExpiringBatches = async (): Promise<ExpiringBatch[]> => {
  const { data } = await authApi.get('/inventory/batches/expiring');
  return data;
};

// Fetch recent movements
export const fetchRecentMovements = async (): Promise<RecentMovement[]> => {
  const { data } = await authApi.get('/inventory/movements/recent');
  return data;
};

export const fetchFifoQueue = async (): Promise<FifoItem[]> => {
  const { data } = await authApi.get('/inventory/queue/fifo');
  return data;
};