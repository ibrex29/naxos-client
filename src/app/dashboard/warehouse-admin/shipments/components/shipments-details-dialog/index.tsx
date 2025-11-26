/* eslint-disable @typescript-eslint/no-explicit-any */
import type { JSX, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, CheckCircle, Clock, Truck } from "lucide-react";
import { DeliveryStatus } from "@/app/api/service/shipmentService";
import { getFileName } from "@/utils/utils";
import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
  WidthType,
} from "docx";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { ShipmentDisplay } from "@/types/shipment";

type ExportFormat = "csv" | "pdf" | "docx" | "xlsx";

interface ShipmentDetailsDialogProps {
  selectedShipment: ShipmentDisplay | null;
  setSelectedShipment: (shipment: ShipmentDisplay | null) => void;
  exportFormat: ExportFormat;
  setExportFormat: (value: ExportFormat) => void;
}

export default function ShipmentDetailsDialog({
  selectedShipment,
  setSelectedShipment,
  exportFormat,
  setExportFormat,
}: ShipmentDetailsDialogProps): JSX.Element {
  const getStatusBadge = (status: DeliveryStatus): JSX.Element => {
    switch (status) {
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "in_transit":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <Truck className="h-3 w-3 mr-1" />
            In Transit
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <Clock className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportShipmentData = (shipment: ShipmentDisplay) => {
    const fileName = `shipment-${shipment.id}`;

    // Headers with Unit Cost To Be Sold
    const headers = [
      "Medicine",
      "Form",
      "Manufacturer",
      "Strength",
      "Batch Number",
      "Unit Type",
      "Expiry Date",
      "Quantity",
      "Unit Cost",
      "Unit Cost To Be Sold",   // NEW
      "Shipment Mode",
    ];

    const data = shipment.items.map((item) => [
      item.medicine.name ?? "Unknown",
      item.medicine.form ?? "N/A",
      item.medicine.manufacturer?.name ?? "—",
      item.medicine.strength ?? "N/A",
      item.batchNumber ?? "N/A",
      item.unitType ?? "N/A",
      item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString()
        : "N/A",
      item.quantity ?? 0,
      item.unitCost ?? 0,
      item.unitCostToBeSold ?? 0,   // NEW
      shipment.shipmentMode,
    ]);

    // ───── CSV ─────
    if (exportFormat === "csv") {
      const csv =
        "data:text/csv;charset=utf-8," +
        headers.join(",") +
        "\n" +
        data
          .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");

      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // ───── PDF ─────
    if (exportFormat === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Shipment: ${shipment.proformaInvoiceNo}`, 20, 20);
      doc.setFontSize(12);
      doc.text(`Supplier: ${shipment.supplier}`, 20, 30);
      doc.text(
        `Received: ${new Date(shipment.receivedDate).toLocaleDateString()}`,
        20,
        40
      );
      doc.text(`Mode: ${shipment.shipmentMode}`, 20, 50);

      const body = data.map((r) => r.map(String));
      (doc as any).autoTable({
        head: [headers],
        body,
        startY: 60,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: { 8: { cellWidth: 28 } }, // fit "Unit Cost To Be Sold"
      });

      doc.save(`${fileName}.pdf`);
      return;
    }

    // ───── DOCX ─────
    if (exportFormat === "docx") {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: `Shipment: ${shipment.proformaInvoiceNo}`,
                heading: "Heading1",
              }),
              new Paragraph(`Supplier: ${shipment.supplier}`),
              new Paragraph(
                `Received: ${new Date(shipment.receivedDate).toLocaleDateString()}`
              ),
              new Paragraph(`Mode: ${shipment.shipmentMode}`),
              new Paragraph({ text: "", spacing: { after: 200 } }),

              new DocxTable({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new DocxTableRow({
                    children: headers.map(
                      (h) =>
                        new DocxTableCell({
                          children: [new Paragraph(h)],
                          width: {
                            size: 100 / headers.length,
                            type: WidthType.PERCENTAGE,
                          },
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
                              width: {
                                size: 100 / headers.length,
                                type: WidthType.PERCENTAGE,
                              },
                            })
                        ),
                      })
                  ),
                ],
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
      return;
    }

    // ───── XLSX ─────
    if (exportFormat === "xlsx") {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Shipment");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      return;
    }

    toast.error("Unsupported export format");
  };

  return (
  <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
      <DialogHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DialogTitle className="text-xl sm:text-2xl">
          Shipment: {selectedShipment?.proformaInvoiceNo}
        </DialogTitle>

        {selectedShipment && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as ExportFormat)}
            >
              <SelectTrigger className="w-[110px] text-xs sm:text-sm">
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
              onClick={() => exportShipmentData(selectedShipment)}
              className="gap-2 text-xs sm:text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </DialogHeader>

      {selectedShipment && (
        <div className="mt-6 space-y-6 text-sm">
          {/* Top Section: Info + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipment Info + Documents */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-base mb-3">Shipment Information</h4>
                <div className="space-y-2 text-sm">
                  {([
                    ["Proforma Invoice", selectedShipment.proformaInvoiceNo],
                    ["Bill of Lading", selectedShipment.billOfLading],
                    ["Supplier", selectedShipment.supplier],
                    ["Received Date", new Date(selectedShipment.receivedDate).toLocaleDateString()],
                    ["Shipment Mode", selectedShipment.shipmentMode],
                    ["Status", getStatusBadge(selectedShipment.deliveryStatus)],
                    ["Created By", selectedShipment.createdBy?.email ?? "—"],
                  ] as [string, ReactNode][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between  py-1">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-medium text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-base mb-3">Documents</h4>
                {selectedShipment.documents.length === 0 ? (
                  <p className="text-muted-foreground">No documents attached.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedShipment.documents.map((doc, idx) => {
                      const docs = [
                        doc.invoiceDoc && { label: "Invoice", url: doc.invoiceDoc, name: doc.invoiceDocName ?? getFileName(doc.invoiceDoc) },
                        doc.qualityCheck && { label: "Quality Check", url: doc.qualityCheck, name: doc.qualityCheckName ?? getFileName(doc.qualityCheck) },
                        doc.packingList && { label: "Packing List", url: doc.packingList, name: doc.packingListName ?? getFileName(doc.packingList) },
                        doc.insurance && { label: "Insurance", url: doc.insurance, name: doc.insuranceName ?? getFileName(doc.insurance) },
                      ].filter(Boolean) as { label: string; url: string; name: string }[];

                      return (
                        <div key={idx} className="space-y-2">
                          {docs.map((d) => (
                            <div key={d.label} className="flex items-center justify-between py-2 border-b last:border-0">
                              <span className="text-muted-foreground text-xs sm:text-sm">{d.label}:</span>
                              <a
                                href={d.url}
                                download={d.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-blue-600 hover:underline text-xs sm:text-sm"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[120px] sm:max-w-[180px]" title={d.name}>
                                  {d.name}
                                </span>
                              </a>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-muted/50 rounded-lg p-5 space-y-3">
              <h4 className="font-semibold text-base">Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">{selectedShipment.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="font-medium">
                    {selectedShipment.items.reduce((s, i) => s + (i.quantity ?? 0), 0)} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost Price</span>
                  <span className="font-medium">
                    NGN {selectedShipment.items.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitCost ?? 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-green-700">
                  <span>Total Selling Price</span>
                  <span>
                    NGN {selectedShipment.items.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitCostToBeSold ?? 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table – Mobile-Friendly Horizontal Scroll */}
          <div className="mt-8">
            <h4 className="font-semibold text-base mb-4">Items in Shipment</h4>

            <div className="relative border rounded-lg overflow-hidden">
              {/* Visual cue for horizontal scroll on mobile */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-gray-200 scrollbar-thumb-gray-400">
                <table className="w-full min-w-[1200px] table-auto border-collapse">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      {[
                        "Medicine",
                        "Form",
                        "Manufacturer",
                        "Strength",
                        "Batch",
                        "Unit Type",
                        "Expiry",
                        "Qty",
                        "Unit Cost",
                        "Unit Cost To Sell",
                      ].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedShipment.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition">
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.medicine.name ?? "—"}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.medicine.form ?? "—"}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.medicine.manufacturer?.name ?? "—"}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.medicine.strength ?? "—"}</td>
                        <td className="px-3 py-4 text-sm font-mono whitespace-nowrap">{item.batchNumber ?? "—"}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.unitType ?? "—"}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">{item.quantity ?? 0}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">NGN {(item.unitCost ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap font-medium text-green-700">
                          NGN {(item.unitCostToBeSold ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile scroll hint */}
              <div className="md:hidden bg-gradient-to-r from-transparent via-transparent to-background pointer-events-none absolute inset-y-0 right-0 w-12 flex items-center justify-end pr-2">
                <div className="bg-muted/80 text-xs text-muted-foreground px-2 py-1 rounded">
                  ← Scroll →
                </div>
              </div>
            </div>

            {/* Optional: Add a note for mobile users */}
            <p className="text-xs text-muted-foreground text-center mt-2 md:hidden">
              Swipe left/right to see all columns
            </p>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
}