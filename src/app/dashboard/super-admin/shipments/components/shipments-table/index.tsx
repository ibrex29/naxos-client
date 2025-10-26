/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table as UITable,
  TableBody,
  TableCell as UITableCell,
  TableHead,
  TableHeader,
  TableRow as UITableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {  DeliveryStatus } from "@/app/api/service/shipmentService";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from "docx";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import toast from "react-hot-toast";
import { ShipmentDisplay } from "@/types/shipment";

interface ShipmentsTableProps {
  shipments: ShipmentDisplay[];
  meta: { itemCount: number; page: number; limit: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean };
  isLoading: boolean;
  getStatusBadge: (status: DeliveryStatus) => JSX.Element;
  handleUpdateDeliveryStatus: (shipmentId: string, deliveryStatus: DeliveryStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  setSelectedShipment: (shipment: ShipmentDisplay | null) => void;
  exportFormat: "csv" | "pdf" | "docx" | "xlsx";
  setExportFormat: (value: "csv" | "pdf" | "docx" | "xlsx") => void;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
}

export default function ShipmentsTable({
  shipments,
  meta,
  isLoading,
  getStatusBadge,
  handleUpdateDeliveryStatus,
  isUpdatingStatus,
  setSelectedShipment,
  exportFormat,
  setExportFormat,
  page,
  setPage,
}: ShipmentsTableProps): JSX.Element {
  const exportShipmentData = (shipment: ShipmentDisplay) => {
    const fileName = `shipment-${shipment.id}`;
    const headers = [
      "Medicine",
      "Form",
      "Manufacturer",
      "Strength",
      "Batch Number",
      "Expiry Date",
      "Quantity",
      "Unit Cost",
      "Unit Cost To Be Sold",
      "Shipment Mode",
    ];
    const data = shipment.items.map((item) => [
      item.medicine.name || "Unknown",
      item.medicine.form || "N/A",
      item.medicine.manufacturer?.name || undefined,
      item.medicine.strength || "N/A",
      item.batchNumber || "N/A",
      item.expiryDate || "N/A",
      item.quantity || 0,
      item.unitCost || 0,
      item.unitCostToBeSold || "N/A",
      shipment.shipmentMode,
    ]);

    switch (exportFormat) {
      case "csv": {
        const csvContent =
          "data:text/csv;charset=utf-8," +
          headers.join(",") +
          "\n" +
          data.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
      case "pdf": {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Shipment: ${shipment.proformaInvoiceNo}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`Supplier: ${shipment.supplier}`, 20, 30);
        doc.text(`Received Date: ${new Date(shipment.receivedDate).toLocaleDateString()}`, 20, 40);
        doc.text(`Shipment Mode: ${shipment.shipmentMode}`, 20, 50);

        const tableData = data.map((row) => row.map((cell) => String(cell)));
        (doc as any).autoTable({
          head: [headers],
          body: tableData,
          startY: 60,
          theme: "grid",
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`${fileName}.pdf`);
        break;
      }
      case "docx": {
        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  text: `Shipment: ${shipment.proformaInvoiceNo}`,
                  heading: "Heading1",
                }),
                new Paragraph(`Supplier: ${shipment.supplier}`),
                new Paragraph(`Received Date: ${new Date(shipment.receivedDate).toLocaleDateString()}`),
                new Paragraph(`Shipment Mode: ${shipment.shipmentMode}`),
                new Paragraph({ text: "", spacing: { after: 200 } }),
                new DocxTable({
                  rows: [
                    new DocxTableRow({
                      children: headers.map(
                        (header) =>
                          new DocxTableCell({
                            children: [new Paragraph(header)],
                            width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
                          })
                      ),
                    }),
                    ...data.map(
                      (row) =>
                        new DocxTableRow({
                          children: row.map(
                            (cell) =>
                              new DocxTableCell({
                                children: [new Paragraph(String(cell))],
                                width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
                              })
                          ),
                        })
                    ),
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ],
            },
          ],
        });

        Packer.toBlob(doc).then((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${fileName}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        break;
      }
      case "xlsx": {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Shipment");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        break;
      }
      default:
        toast.error("Unsupported export format");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <UITable>
            <TableHeader>
              <UITableRow>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              </UITableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <UITableRow key={index}>
                  <UITableCell><Skeleton className="h-4 w-32" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-28" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-36" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-24" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-16" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-24" /></UITableCell>
                  <UITableCell><Skeleton className="h-4 w-16" /></UITableCell>
                  <UITableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </UITableCell>
                </UITableRow>
              ))}
            </TableBody>
          </UITable>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipments</CardTitle>
      </CardHeader>
      <CardContent>
        <UITable>
          <TableHeader>
            <UITableRow>
              <TableHead>Proforma Invoice</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>BOL</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Shipment Mode</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Actions</TableHead>
            </UITableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => (
              <UITableRow key={shipment.id}>
                <UITableCell>{shipment.proformaInvoiceNo}</UITableCell>
                <UITableCell>{shipment.supplier}</UITableCell>
                <UITableCell>{shipment.billOfLading}</UITableCell>
                <UITableCell>{new Date(shipment.receivedDate).toLocaleDateString()}</UITableCell>
                <UITableCell>{shipment.status}</UITableCell>
                <UITableCell>{getStatusBadge(shipment.deliveryStatus)}</UITableCell>
                <UITableCell>{shipment.shipmentMode}</UITableCell>
                <UITableCell>{shipment.items.length}</UITableCell>
                <UITableCell>
                  <div className="flex gap-2">
                    <Select
                      value={shipment.deliveryStatus}
                      onValueChange={(value) => handleUpdateDeliveryStatus(shipment.id, value as DeliveryStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      View
                    </Button>
                    <div className="flex items-center gap-2">
                      <Select
                        value={exportFormat}
                        onValueChange={(value) => setExportFormat(value as "csv" | "pdf" | "docx" | "xlsx")}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">Word</SelectItem>
                          <SelectItem value="xlsx">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportShipmentData(shipment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                            </div>
                            </div>
                  </UITableCell>
                </UITableRow>
                
              ))}
            </TableBody>
          </UITable>
          {shipments.length === 0 && (
            <div className="text-center p-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipments found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-muted-foreground">
            Showing {shipments.length} of {meta.itemCount} shipments
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= meta.pageCount}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
}