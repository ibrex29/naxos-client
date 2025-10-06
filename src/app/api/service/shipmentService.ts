import authApi from "@/utils/authApi";

export type SortField = "proformaInvoiceNo" | "supplier" | "createdAt" | "billOfLading" | "shipmentMode" | undefined;
export type ShipmentStatus = "IN" | "OUT";
export type DeliveryStatus = "delivered" | "cancelled" | "pending" | "in_transit";
export type FilterStatus = ShipmentStatus | "all";
export type FilterDeliveryStatus = DeliveryStatus | "all";
export type ShipmentMode = "AIR" | "SEA" | "LAND";
export type FilterShipmentMode = ShipmentMode | "all";

export enum MedicineFormEnum {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  SYRUP = "Syrup",
  INJECTION = "Injection",
  CREAM = "Cream",
  OINTMENT = "Ointment",
  DROPS = "Drops",
  INHALER = "Inhaler",
  SUPPOSITORY = "Suppository",
  POWDER = "Powder",
}

export interface ShipmentDocument {
  invoiceDoc?: string;
  invoiceDocName?: string;
  qualityCheck?: string;
  qualityCheckName?: string;
  packingList?: string;
  packingListName?: string;
  insurance?: string;
  insuranceName?: string;
}

export interface Medicine {
  id?: string;
  name: string;
  strength?: string;
  form: MedicineFormEnum;
  manufacturerId?: string;
  manufacturer?: string; // For display purposes in UI
  manufacturingDate?: string;
  packSize?: number;
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;
  unitCost?: number;
  unitCostToBeSold?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ShipmentItem {
  id?: string;
  shipmentId?: string;
  medicineId?: string;
  medicine: Medicine;
}

export interface CreatedBy {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface Shipment {
  id: string;
  proformaInvoiceNo: string;
  billOfLading: string;
  supplier: string;
  receivedDate: string | Date;
  status: ShipmentStatus;
  deliveryStatus: DeliveryStatus;
  shipmentMode: ShipmentMode;
  documents: ShipmentDocument[];
  items: ShipmentItem[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  createdById: string;
  createdBy?: CreatedBy;
}

export interface ShipmentQueryParams {
  search?: string;
  status?: FilterStatus;
  deliveryStatus?: FilterDeliveryStatus;
  shipmentMode?: FilterShipmentMode;
  sortField?: SortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ShipmentResponse {
  data: Shipment[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const createShipment = async (
  shipmentData: {
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
): Promise<Shipment> => {
  const { data } = await authApi.post("/shipments", shipmentData);
  return data;
};

export const fetchShipments = async (params: ShipmentQueryParams = {}): Promise<ShipmentResponse> => {
  const {
    search = "",
    status,
    deliveryStatus,
    shipmentMode,
    sortField = "createdAt",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = params;

  const queryParams = new URLSearchParams({
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
    sortField: sortField || "",
    ...(search && { search }),
    ...(status && status !== "all" && { status }),
    ...(deliveryStatus && deliveryStatus !== "all" && { deliveryStatus }),
    ...(shipmentMode && shipmentMode !== "all" && { shipmentMode }),
  });

  const { data } = await authApi.get(`/shipments?${queryParams.toString()}`);
  return data;
};

export const fetchShipmentById = async (shipmentId: string): Promise<Shipment> => {
  const { data } = await authApi.get(`/shipments/${shipmentId}`);
  return data;
};