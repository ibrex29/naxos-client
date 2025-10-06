
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserQueryParams, UserResponse, StaffSummary, fetchUsers, fetchUserById, createUser, updateUser, activateUser, deactivateUser, fetchStaffSummary } from '@/app/api/service/userService';

// Query: Get staff summary
export const useStaffSummary = () => {
  return useQuery<StaffSummary, Error>({
    queryKey: ['staffSummary'],
    queryFn: fetchStaffSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Query: Get users with pagination and filters
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery<UserResponse, Error>({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // For smooth pagination
  });
};

// Query: Get single user by ID
export const useUser = (userId: string | undefined) => {
  return useQuery<User | undefined, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return undefined;
      return fetchUserById(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Mutation: Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users list and staff summary
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staffSummary'] });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });
};

// Mutation: Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_, variables) => {
      // Invalidate and refetch specific user, users list, and staff summary
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staffSummary'] });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
};

// Mutation: Activate user
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      // Invalidate and refetch users list and staff summary
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staffSummary'] });
    },
    onError: (error) => {
      console.error('Error activating user:', error);
    },
  });
};

// Mutation: Deactivate user
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      // Invalidate and refetch users list and staff summary
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staffSummary'] });
    },
    onError: (error) => {
      console.error('Error deactivating user:', error);
    },
  });
};

// Custom hook for user management
export const useUserManagement = () => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  return {
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    isLoading: createUser.isPending || updateUser.isPending || activateUser.isPending || deactivateUser.isPending,
    error: createUser.error || updateUser.error || activateUser.error || deactivateUser.error,
  };
};