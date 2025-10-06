/* eslint-disable @typescript-eslint/no-explicit-any */
// manufacturerService.ts
import authApi from "@/utils/authApi"; // Assuming this is your API client, adjust path as needed

export interface Manufacturer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById?: string | null;
  createdBy?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  updatedBy?: any; 
  medicines?: any[]; 
}

export interface CreateManufacturerData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  isActive?: boolean;
}

export interface ManufacturerQueryParams {
  search?: string;
  country?: string;
  isActive?: boolean;
  sortField?: 'createdAt' | 'updatedAt' | 'country' | 'phone' | 'email' | 'code' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ManufacturerResponse {
  data: Manufacturer[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const createManufacturer = async (
  manufacturerData: CreateManufacturerData
): Promise<Manufacturer> => {
  const { data } = await authApi.post("/manufacturers", manufacturerData);
  return data;
};

export const fetchManufacturers = async (params: ManufacturerQueryParams = {}): Promise<ManufacturerResponse> => {
  const {
    search = "",
    country,
    isActive,
    sortField = "createdAt",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = params;

  const queryParams = new URLSearchParams({
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
    sortField,
    ...(search && { search }),
    ...(country && { country }),
    ...(isActive !== undefined && { isActive: isActive.toString() }),
  });

  const { data } = await authApi.get(`/manufacturers/paginated?${queryParams.toString()}`);
  return data;
};

export const fetchManufacturerById = async (manufacturerId: string): Promise<Manufacturer> => {
  const { data } = await authApi.get(`/manufacturers/${manufacturerId}`);
  return data;
};

export const updateManufacturer = async (
  id: string,
  data: Partial<CreateManufacturerData>
): Promise<Manufacturer> => {
  const { data: updatedData } = await authApi.patch(`/manufacturers/${id}`, data);
  return updatedData;
};

export const deleteManufacturer = async (id: string): Promise<Manufacturer> => {
  const { data } = await authApi.delete(`/manufacturers/${id}`);
  return data;
};