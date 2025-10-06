import { UserRole } from '@/types/enum';
import authApi from '@/utils/authApi';

// Interface for the user profile
export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  otherNames?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  phone?: string;
}

// Interface for the user
export interface User {
  id: string;
  code?: string
  fullname: string;
  email: string;
  password?: string;
  role: UserRole ;
  isActive: boolean;
  isVerified?: boolean;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  phoneNumber?: string;
  profile?: UserProfile;
}

// Interface for query parameters used in fetching users
export interface UserQueryParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  sortField?: 'createdAt' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Interface for staff summary
export interface StaffSummary {
  total: number;
  administrators: number;
  salesStaff: number;
  warehouseStaff: number;
  financeStaff: number;
}

// Interface for the paginated response
export interface UserResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Fetch users with pagination and filters
export const fetchUsers = async (params: UserQueryParams = {}): Promise<UserResponse> => {
  const {
    search = '',
    role = '',
    isActive,
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
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive.toString() }),
  });

  const { data } = await authApi.get(`/users?${queryParams.toString()}`);
  return data;
};

// Fetch a single user by ID
export const fetchUserById = async (userId: string): Promise<User> => {
  const { data } = await authApi.get(`/users/${userId}`);
  return data;
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isActive' | 'isVerified' | 'createdByUserId' | 'profile'>): Promise<User> => {
  const { data } = await authApi.post('/users/signup', userData);
  return data;
};

// Update an existing user
export const updateUser = async ({ userId, userData }: { userId: string; userData: Partial<User> }): Promise<User> => {
  const { data } = await authApi.put(`/users/${userId}`, userData);
  return data;
};

// Activate a user
export const activateUser = async (userId: string): Promise<User> => {
  const { data } = await authApi.patch(`/users/${userId}/activate`);
  return data;
};

// Deactivate a user
export const deactivateUser = async (userId: string): Promise<User> => {
  const { data } = await authApi.patch(`/users/${userId}/deactivate`);
  return data;
};

// Fetch staff summary
export const fetchStaffSummary = async (): Promise<StaffSummary> => {
  const { data } = await authApi.get('/users/staff-summary');
  return data;
};
