import { JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { SortField, FilterStatus, FilterDeliveryStatus, FilterShipmentMode } from "@/app/api/service/shipmentService";

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  statusFilter: FilterStatus;
  setStatusFilter: (value: FilterStatus) => void;
  deliveryStatusFilter: FilterDeliveryStatus;
  setDeliveryStatusFilter: (value: FilterDeliveryStatus) => void;
  shipmentModeFilter: FilterShipmentMode;
  setShipmentModeFilter: (value: FilterShipmentMode) => void;
}

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  deliveryStatusFilter,
  setDeliveryStatusFilter,
  shipmentModeFilter,
  setShipmentModeFilter,
}: SearchAndFiltersProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by proforma invoice, supplier, or BOL number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortField || ""} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sort field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="proformaInvoiceNo">Proforma Invoice</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="billOfLading">Bill of Lading</SelectItem>
                <SelectItem value="shipmentMode">Shipment Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
              <SelectTrigger>
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="IN">Inbound</SelectItem>
                <SelectItem value="OUT">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Delivery Status</Label>
            <Select
              value={deliveryStatusFilter}
              onValueChange={(value) => setDeliveryStatusFilter(value as FilterDeliveryStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Shipment Mode</Label>
            <Select
              value={shipmentModeFilter}
              onValueChange={(value) => setShipmentModeFilter(value as FilterShipmentMode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="AIR">Air</SelectItem>
                <SelectItem value="SEA">Sea</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}