/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {  SortField, FilterStatus, FilterDeliveryStatus, FilterShipmentMode, ShipmentMode, ShipmentDocument, ShipmentItem } from "@/app/api/service/shipmentService";
import { useShipments, useShipmentManagement } from "@/hooks/use-shipment-management";
import { useManufacturers } from "@/hooks/use-manufacturer";

import toast from "react-hot-toast";
import Header from "./components/header";
import StatsCards from "./components/stats-card";
import SearchAndFilters from "./components/search-filter";
import ShipmentList from "./components/shipments-list";
import AddShipmentDialog from "./components/add-shipment-dialog";
import ShipmentDetailsDialog from "./components/shipments-details-dialog";
import { ShipmentDisplay } from "@/types/shipment";

export default function ShipmentReceiving() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<FilterDeliveryStatus>("all");
  const [shipmentModeFilter, setShipmentModeFilter] = useState<FilterShipmentMode>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDisplay | null>(null);
  const [newShipmentItems, setNewShipmentItems] = useState<ShipmentItem[]>([]);
  const [invoiceDoc, setInvoiceDoc] = useState<Array<{ url: string; fileName: string }>>([]);
  const [qualityCheck, setQualityCheck] = useState<Array<{ url: string; fileName: string }>>([]);
  const [packingList, setPackingList] = useState<Array<{ url: string; fileName: string }>>([]);
  const [insurance, setInsurance] = useState<Array<{ url: string; fileName: string }>>([]);
  const [formData, setFormData] = useState({
    proformaInvoiceNo: "",
    billOfLading: "",
    supplier: "",
    receivedDate: "",
    shipmentMode: "SEA" as ShipmentMode,
  });
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "docx" | "xlsx">("csv");
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [manufacturerPage, setManufacturerPage] = useState(1);
  const [manufacturerLimit] = useState(10);

  // Fetch manufacturers
  const { data: manufacturerResponse, isLoading: isManufacturersLoading } = useManufacturers({
    search: manufacturerSearch,
    page: manufacturerPage,
    limit: manufacturerLimit,
    sortField: "name",
    sortOrder: "desc",
  });

  const manufacturers = manufacturerResponse?.data || [];
  const manufacturerMeta = manufacturerResponse?.meta || {
    page: 1,
    limit: 10,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  // Fetch shipments
  const { data: shipmentResponse, isLoading, error } = useShipments({
    search: searchTerm,
    sortField,
    sortOrder,
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
    deliveryStatus: deliveryStatusFilter !== "all" ? deliveryStatusFilter : undefined,
    shipmentMode: shipmentModeFilter !== "all" ? shipmentModeFilter : undefined,
  });

  const shipments = shipmentResponse?.data || [];
  const meta = shipmentResponse?.meta || { page: 1, limit: 10, itemCount: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false };

  // Shipment creation
  const { createMutation, isCreating } = useShipmentManagement();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRecordShipment = async () => {
    if (
      !formData.proformaInvoiceNo ||
      !formData.billOfLading ||
      !formData.supplier ||
      !formData.receivedDate ||
      !formData.shipmentMode ||
      newShipmentItems.length === 0
    ) {
      toast.error(
        "Please fill all required fields: proforma invoice, bill of lading, supplier, received date, shipment mode, and at least one item."
      );
      return;
    }

    const invalidItem = newShipmentItems.find(
      (item) =>
        !item.medicine.name ||
        !item.medicine.form ||
        !item.medicine.manufacturerId ||
        !item.medicine.batchNumber ||
        !item.medicine.expiryDate ||
        !Number.isFinite(item.medicine.quantity) ||
        item.medicine?.quantity <= 0 ||
        !Number.isFinite(item.medicine.unitCost) ||
        item.medicine?.unitCost <= 0 ||
        !Number.isFinite(item.medicine.unitCostToBeSold) ||
        item.medicine?.unitCostToBeSold <= 0
    );

    if (invalidItem) {
      toast.error(
        "All items must have a valid medicine name, form, manufacturer, batch number, expiry date, quantity, unit cost, and unit cost to be sold."
      );
      return;
    }

    if (invoiceDoc.length === 0 && qualityCheck.length === 0 && packingList.length === 0 && insurance.length === 0) {
      toast.error("Please upload at least one document (invoice, quality check, packing list, or insurance).");
      return;
    }

    const documents: ShipmentDocument[] = [];
    if (invoiceDoc.length > 0) {
      documents.push({ invoiceDoc: invoiceDoc[0].url, invoiceDocName: invoiceDoc[0].fileName });
    }
    if (qualityCheck.length > 0) {
      documents.push({ qualityCheck: qualityCheck[0].url, qualityCheckName: qualityCheck[0].fileName });
    }
    if (packingList.length > 0) {
      documents.push({ packingList: packingList[0].url, packingListName: packingList[0].fileName });
    }
    if (insurance.length > 0) {
      documents.push({ insurance: insurance[0].url, insuranceName: insurance[0].fileName });
    }

    const shipmentData = {
      proformaInvoiceNo: formData.proformaInvoiceNo,
      billOfLading: formData.billOfLading,
      supplier: formData.supplier,
      receivedDate: formData.receivedDate,
      shipmentMode: formData.shipmentMode,
      documents,
      items: newShipmentItems.map((item) => ({
        medicine: {
          name: item.medicine.name,
          form: item.medicine.form,
          manufacturerId: item.medicine.manufacturerId,
          strength: item.medicine.strength ?? "",
          manufacturingDate: item.medicine.manufacturingDate ?? "",
          packSize: item.medicine.packSize ?? 0,
          batchNumber: String(item.medicine.batchNumber),
          expiryDate: String(item.medicine.expiryDate),
          quantity: Number(item.medicine.quantity),
          unitCost: Number(item.medicine.unitCost),
          unitCostToBeSold: Number(item.medicine.unitCostToBeSold),
        },
      })),
    };

    try {
      await createMutation.mutateAsync(shipmentData);
      toast.success("Shipment recorded successfully");
      setNewShipmentItems([]);
      setInvoiceDoc([]);
      setQualityCheck([]);
      setPackingList([]);
      setInsurance([]);
      setFormData({
        proformaInvoiceNo: "",
        billOfLading: "",
        supplier: "",
        receivedDate: "",
        shipmentMode: "SEA" as ShipmentMode,
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(`Failed to record shipment: ${error.message || "Unknown error"}`);
    }
  };

  // Handle manufacturer search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setManufacturerPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [manufacturerSearch]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <Header setIsAddDialogOpen={setIsAddDialogOpen} />
      <StatsCards shipments={shipments} meta={meta} />
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        deliveryStatusFilter={deliveryStatusFilter}
        setDeliveryStatusFilter={setDeliveryStatusFilter}
        shipmentModeFilter={shipmentModeFilter}
        setShipmentModeFilter={setShipmentModeFilter}
      />
      <ShipmentList
        shipments={shipments}
        meta={meta}
        isLoading={isLoading}
        setSelectedShipment={setSelectedShipment}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        page={page}
        setPage={setPage}
      />
      <AddShipmentDialog
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        newShipmentItems={newShipmentItems}
        setNewShipmentItems={setNewShipmentItems}
        invoiceDoc={invoiceDoc}
        setInvoiceDoc={setInvoiceDoc}
        qualityCheck={qualityCheck}
        setQualityCheck={setQualityCheck}
        packingList={packingList}
        setPackingList={setPackingList}
        insurance={insurance}
        setInsurance={setInsurance}
        manufacturers={manufacturers}
        isManufacturersLoading={isManufacturersLoading}
        manufacturerSearch={manufacturerSearch}
        setManufacturerSearch={setManufacturerSearch}
        manufacturerMeta={manufacturerMeta}
        setManufacturerPage={setManufacturerPage}
        handleRecordShipment={handleRecordShipment}
        isCreating={isCreating}
      />
      <ShipmentDetailsDialog
        selectedShipment={selectedShipment}
        setSelectedShipment={setSelectedShipment}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
      />
    </div>
  );
}