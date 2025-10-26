/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from "react";
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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="mt-4 flex items-center justify-between">
            <span>Shipment Details: {selectedShipment?.proformaInvoiceNo}</span>
            {selectedShipment && (
              <div className="flex items-center gap-2">
                <Select
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as ExportFormat)}
                >
                  <SelectTrigger className="w-[120px]">
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
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {selectedShipment && (
          <div className="space-y-6">
            {/* Shipment Info + Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Shipment Information</h4>
                  <div className="space-y-2 text-sm">
                      {(() => {
                        const info: [string, string | JSX.Element][] = [
                          ["Proforma Invoice", selectedShipment.proformaInvoiceNo],
                          ["Bill of Lading", selectedShipment.billOfLading],
                          ["Supplier", selectedShipment.supplier],
                          [
                            "Received Date",
                            new Date(selectedShipment.receivedDate).toLocaleDateString(),
                          ],
                          ["Shipment Mode", selectedShipment.shipmentMode],
                          ["Status", getStatusBadge(selectedShipment.deliveryStatus)],
                          [
                            "Created By",
                            `${selectedShipment.createdBy?.email ?? ""}`.trim(),
                          ],
                        ];
                        return info.map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-muted-foreground">{label}:</span>
                            <span>{value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Documents</h4>
                  {selectedShipment.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No documents attached.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedShipment.documents.map((doc, idx) => {
                        const entries = [
                          doc.invoiceDoc && {
                            label: "Invoice",
                            url: doc.invoiceDoc,
                            name: doc.invoiceDocName ?? getFileName(doc.invoiceDoc),
                          },
                          doc.qualityCheck && {
                            label: "Quality Check",
                            url: doc.qualityCheck,
                            name:
                              doc.qualityCheckName ?? getFileName(doc.qualityCheck),
                          },
                          doc.packingList && {
                            label: "Packing List",
                            url: doc.packingList,
                            name:
                              doc.packingListName ?? getFileName(doc.packingList),
                          },
                          doc.insurance && {
                            label: "Insurance",
                            url: doc.insurance,
                            name: doc.insuranceName ?? getFileName(doc.insurance),
                          },
                        ].filter(Boolean) as {
                          label: string;
                          url: string;
                          name: string;
                        }[];

                        return (
                          <div key={idx} className="space-y-2">
                            {entries.map((e) => (
                              <div
                                key={e.label}
                                className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                              >
                                <span className="text-muted-foreground">
                                  {e.label}:
                                </span>
                                <a
                                  href={e.url}
                                  download={e.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                  <Download className="h-4 w-4" />
                                  <span
                                    className="truncate max-w-[140px]"
                                    title={e.name}
                                  >
                                    {e.name}
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

              {/* Summary */}
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span>{selectedShipment.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <span>
                      {selectedShipment.items.reduce(
                        (s, i) => s + (i.quantity ?? 0),
                        0
                      )}{" "}
                      units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost Price:</span>
                    <span>
                      NGN
                      {selectedShipment.items
                        .reduce(
                          (s, i) => s + (i.quantity ?? 0) * (i.unitCost ?? 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Selling Price:</span>
                    <span className="text-green-700 font-medium">
                      NGN
                      {selectedShipment.items
                        .reduce(
                          (s, i) =>
                            s + (i.quantity ?? 0) * (i.unitCostToBeSold ?? 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table – 9 columns */}
            <div>
              <h4 className="font-medium mb-4">Items in Shipment</h4>
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <div className="grid grid-cols-9 gap-4 p-3 bg-muted/50 text-sm font-medium">
                  <span>Medicine</span>
                  <span>Form</span>
                  <span>Manufacturer</span>
                  <span>Strength</span>
                  <span>Batch</span>
                  <span>Expiry</span>
                  <span>Qty</span>
                  <span>Unit Cost</span>
                  <span>Unit Cost To Sell</span>
                </div>

                {selectedShipment.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-9 gap-4 p-3 border-t text-sm"
                  >
                    <span>{item.medicine.name ?? "—"}</span>
                    <span>{item.medicine.form ?? "—"}</span>
                    <span>{item.medicine.manufacturer?.name ?? "—"}</span>
                    <span>{item.medicine.strength ?? "—"}</span>
                    <span className="font-mono">{item.batchNumber ?? "—"}</span>
                    <span>
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString()
                        : "—"}
                    </span>
                    <span>{item.quantity ?? 0}</span>
                    <span>NGN{(item.unitCost ?? 0).toFixed(2)}</span>
                    <span className="text-green-700 font-medium">
                      NGN{(item.unitCostToBeSold ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}