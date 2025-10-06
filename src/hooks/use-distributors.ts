import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Distributor, DistributorQueryParams, DistributorResponse, DistributorAnalytics, fetchDistributors, fetchDistributorById, createDistributor, updateDistributor, fetchDistributorAnalytics } from '@/app/api/service/distributorService';

// Query: Get distributor analytics
export const useDistributorAnalytics = () => {
  return useQuery<DistributorAnalytics, Error>({
    queryKey: ['distributorAnalytics'],
    queryFn: fetchDistributorAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Query: Get distributors with pagination and filters
export const useDistributors = (params: DistributorQueryParams = {}) => {
  return useQuery<DistributorResponse, Error>({
    queryKey: ['distributors', params],
    queryFn: () => fetchDistributors(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // For smooth pagination
  });
};

// Query: Get single distributor by ID
export const useDistributor = (distributorId: string | undefined) => {
  return useQuery<Distributor | undefined, Error>({
    queryKey: ['distributor', distributorId],
    queryFn: async () => {
      if (!distributorId) return undefined;
      return fetchDistributorById(distributorId);
    },
    enabled: !!distributorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Mutation: Create distributor
export const useCreateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDistributor,
    onSuccess: () => {
      // Invalidate and refetch distributors list and analytics
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      queryClient.invalidateQueries({ queryKey: ['distributorAnalytics'] });
    },
    onError: (error) => {
      console.error('Error creating distributor:', error);
    },
  });
};

// Mutation: Update distributor
export const useUpdateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDistributor,
    onSuccess: (_, variables) => {
      // Invalidate and refetch specific distributor, distributors list, and analytics
      queryClient.invalidateQueries({ queryKey: ['distributor', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      queryClient.invalidateQueries({ queryKey: ['distributorAnalytics'] });
    },
    onError: (error) => {
      console.error('Error updating distributor:', error);
    },
  });
};

// Custom hook for distributor management
export const useDistributorManagement = () => {
  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();

  return {
    createDistributor,
    updateDistributor,
    isLoading: createDistributor.isPending || updateDistributor.isPending,
    error: createDistributor.error || updateDistributor.error,
  };
};