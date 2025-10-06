// use-manufacturer-management.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createManufacturer,
  fetchManufacturers,
  Manufacturer,
  ManufacturerResponse,
  ManufacturerQueryParams,
  updateManufacturer,
  deleteManufacturer,
  CreateManufacturerData,
} from "@/app/api/service/manufacturerService"; 

export const useManufacturers = (params: ManufacturerQueryParams = {}) => {
  return useQuery<ManufacturerResponse, Error>({
    queryKey: ["manufacturers", params],
    queryFn: () => fetchManufacturers(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Manufacturer,
    Error,
    CreateManufacturerData
  >({
    mutationFn: createManufacturer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
    },
    onError: (error) => {
      console.error("Error creating manufacturer:", error);
    },
  });
};

export const useUpdateManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Manufacturer,
    Error,
    { id: string; data: Partial<CreateManufacturerData> }
  >({
    mutationFn: ({ id, data }) => updateManufacturer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
    },
    onError: (error) => {
      console.error("Error updating manufacturer:", error);
    },
  });
};

export const useDeleteManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Manufacturer,
    Error,
    string
  >({
    mutationFn: deleteManufacturer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
    },
    onError: (error) => {
      console.error("Error deleting manufacturer:", error);
    },
  });
};

export const useManufacturerManagement = () => {
  const createMutation = useCreateManufacturer();
  const updateMutation = useUpdateManufacturer();
  const deleteMutation = useDeleteManufacturer();

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
};