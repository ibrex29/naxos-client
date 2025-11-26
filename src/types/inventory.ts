import { MedicineFormEnum } from "@/app/api/service/shipmentService";

export interface InventoryItem {
  id: string;
  name: string;
  strength: string;
  form: MedicineFormEnum;
  manufacturer: string;
  manufacturingDate: string;
  packSize: number;
  countryOfOrigin: string;
  createdAt: string;
  updatedAt: string;
  shipmentItems: Array<{
    id: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitCost: number;
    unitType?: string;
  }>;
}

export interface InventoryOverview {
  totalStockValue: number;
  lowStockItems: number;
  expiringSoon: number;
  activeItems: number;
}

export interface ExpiringBatch {
  id: string;
  shipmentId: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
  medicine: {
    id: string;
    name: string;
    strength: string;
    form: string;
    manufacturer: string;
  };
}