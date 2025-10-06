import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShipment,
  DeliveryStatus,
  fetchShipments,
  Shipment,
  ShipmentDocument,
  ShipmentQueryParams,
  ShipmentResponse,
  MedicineFormEnum,
  ShipmentMode,
} from "@/app/api/service/shipmentService";
import authApi from "@/utils/authApi";

export const useShipments = (params: ShipmentQueryParams = {}) => {
  return useQuery<ShipmentResponse, Error>({
    queryKey: ["shipments", params],
    queryFn: () => fetchShipments(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Shipment,
    Error,
    {
      proformaInvoiceNo: string;
      billOfLading: string;
      supplier: string;
      receivedDate: string;
      shipmentMode: ShipmentMode;
      documents: ShipmentDocument[];
      items: {
        medicine: {
          name: string;
          form: MedicineFormEnum;
          manufacturerId?: string;
          strength?: string;
          manufacturingDate?: string;
          packSize?: number;
          batchNumber: string;
          expiryDate: string;
          quantity: number;
          unitCost: number;
          unitCostToBeSold: number;
        };
      }[];
    }
  >({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
    onError: (error) => {
      console.error("Error creating shipment:", error);
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Shipment,
    Error,
    { shipmentId: string; deliveryStatus: DeliveryStatus }
  >({
    mutationFn: ({ shipmentId, deliveryStatus }) =>
      authApi.patch(`/shipments/${shipmentId}/delivery-status`, { deliveryStatus }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
    onError: (error) => {
      console.error("Error updating delivery status:", error);
    },
  });
};

export const useShipmentManagement = () => {
  const createMutation = useCreateShipment();
  const updateStatusMutation = useUpdateDeliveryStatus();

  return {
    createMutation,
    updateStatusMutation,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isUpdatingStatus: updateStatusMutation.isPending,
    updateStatusError: updateStatusMutation.error,
  };
};