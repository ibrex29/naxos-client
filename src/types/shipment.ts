import { DeliveryStatus, Manufacturer, MedicineFormEnum, ShipmentDocument, ShipmentMode, ShipmentStatus } from "@/app/api/service/shipmentService";

export interface Medicine {
  id?: string;
  name: string;
  strength?: string;
  form: MedicineFormEnum;
  manufacturerId?: string;
  manufacturer?: Manufacturer; 
  manufacturingDate?: string;
  packSize?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
 
}

export interface ShipmentItem {
  id?: string;
  shipmentId?: string;
  medicineId?: string;
  medicine: Medicine;
   batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitCost: number;
  unitCostToBeSold: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreatedBy {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface ShipmentDisplay {
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