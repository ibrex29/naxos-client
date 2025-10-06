/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { DeliveryStatus, FilterDeliveryStatus, FilterStatus, Shipment, SortField, FilterShipmentMode } from "@/app/api/service/shipmentService";
import { useShipments, useShipmentManagement } from "@/hooks/use-shipment-management";

import toast from "react-hot-toast";
import {  CheckCircle, Clock, Truck } from "lucide-react";
import SearchAndFilters from "./components/search-filter";
import ShipmentDetailsDialog from "./components/shipment-details-dialog";
import ShipmentsTable from "./components/shipments-table";
import StatsCards from "./components/stats-card";
import Header from "./components/header";
import { Badge } from "@/components/ui/badge";

export default function ShipmentAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<FilterDeliveryStatus>("all");
  const [shipmentModeFilter, setShipmentModeFilter] = useState<FilterShipmentMode>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "docx" | "xlsx">("csv");

  // Fetch shipments with React Query
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

  // Update shipment mutation
  const { updateStatusMutation, isUpdatingStatus } = useShipmentManagement();

  const handleUpdateDeliveryStatus = async (shipmentId: string, deliveryStatus: DeliveryStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ shipmentId, deliveryStatus });
      toast.success(`Delivery status updated to ${deliveryStatus}`);
    } catch (error: any) {
      toast.error(`Failed to update delivery status: ${error.message || "Unknown error"}`);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortField("createdAt");
    setSortOrder("desc");
    setStatusFilter("all");
    setDeliveryStatusFilter("all");
    setShipmentModeFilter("all");
    setPage(1);
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <Header />
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
        resetFilters={resetFilters}
      />
      <ShipmentsTable
        shipments={shipments}
        meta={meta}
        isLoading={isLoading}
        getStatusBadge={(status: DeliveryStatus) => (
          <Badge variant={status === "delivered" ? "default" : status === "pending" ? "warning" : status === "in_transit" ? "default" : "destructive"}
                 className={status === "delivered" ? "bg-green-100 text-green-800" : status === "pending" ? "bg-yellow-100 text-yellow-800" : status === "in_transit" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}>
            {status === "delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === "pending" && <Clock className="h-3 w-3 mr-1" />}
            {status === "in_transit" && <Truck className="h-3 w-3 mr-1" />}
            {status === "cancelled" && <Clock className="h-3 w-3 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
        handleUpdateDeliveryStatus={handleUpdateDeliveryStatus}
        isUpdatingStatus={isUpdatingStatus}
        setSelectedShipment={setSelectedShipment}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        page={page}
        setPage={setPage}
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