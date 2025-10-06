import authApi from '@/utils/authApi';

// Enum for distributor types
export enum DistributorType {
  Wholesaler = 'WHOLESALER',
  Hospital = 'HOSPITAL',
  Pharmacy = 'PHARMACY',
  Clinic = 'CLINIC',
  NGO = 'NGO',
  Chemist = 'CHEMIST',
}

// Interface for distributor
export interface Distributor {
  id: string;
  name: string;
  type: DistributorType;
  code: string;
  email?: string;
  phone: string;
  address: string;
  isActive: boolean;
  creditLimit: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  updatedById?: string | null;
  totalPurchases: number;
  latestOrderTotal?: number;
  lastOrder?: string | null;
}

// Interface for query parameters used in fetching distributors
export interface DistributorQueryParams {
  search?: string;
  type?: string;
  sortField?: 'createdAt' | 'name' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Interface for distributor analytics
export interface DistributorAnalytics {
  totalDistributors: number;
  activeDistributors: number;
  totalSales: number;
  byType: {
    [key in DistributorType]?: {
      total: number;
      active: number;
      sales: number;
    };
  };
}

// Interface for the paginated response
export interface DistributorResponse {
  data: Distributor[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Fetch distributors with pagination and filters
export const fetchDistributors = async (params: DistributorQueryParams = {}): Promise<DistributorResponse> => {
  const {
    search = '',
    type = '',
    sortField = 'createdAt',
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
    ...(type && { type }),
  });

  const { data } = await authApi.get(`/distributors?${queryParams.toString()}`);
  return data;
};

// Fetch a single distributor by ID
export const fetchDistributorById = async (distributorId: string): Promise<Distributor> => {
  const { data } = await authApi.get(`/distributors/${distributorId}`);
  return data;
};

// Create a new distributor
export const createDistributor = async (distributorData: Omit<Distributor, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'createdById' | 'updatedById' | 'totalPurchases' | 'latestOrderTotal' | 'lastOrder' | 'code'>): Promise<Distributor> => {
  const { data } = await authApi.post('/distributors', distributorData);
  return data;
};

// Update an existing distributor
export const updateDistributor = async ({ distributorId, distributorData }: { distributorId: string; distributorData: Partial<Distributor> }): Promise<Distributor> => {
  const { data } = await authApi.put(`/distributors/${distributorId}`, distributorData);
  return data;
};

// Fetch distributor analytics
export const fetchDistributorAnalytics = async (): Promise<DistributorAnalytics> => {
  const { data } = await authApi.get('/distributors/analytics');
  return data;
};