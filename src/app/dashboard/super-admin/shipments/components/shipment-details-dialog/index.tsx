/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { Shipment } from "@/app/api/service/shipmentService";
import { getFileName } from "@/utils/utils";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from "docx";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import toast from "react-hot-toast";

interface ShipmentDetailsDialogProps {
  selectedShipment: Shipment | null;
  setSelectedShipment: (shipment: Shipment | null) => void;
  exportFormat: "csv" | "pdf" | "docx" | "xlsx";
  setExportFormat: (value: "csv" | "pdf" | "docx" | "xlsx") => void;
}

export default function ShipmentDetailsDialog({
  selectedShipment,
  setSelectedShipment,
  exportFormat,
  setExportFormat,
}: ShipmentDetailsDialogProps): JSX.Element {
  const exportShipmentData = (shipment: Shipment) => {
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
      item.medicine.manufacturer || "N/A",
      item.medicine.strength || "N/A",
      item.medicine.batchNumber || "N/A",
      item.medicine.expiryDate || "N/A",
      item.medicine.quantity || 0,
      item.medicine.unitCost || 0,
      item.medicine.unitCostToBeSold || "N/A",
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

  return (
    <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shipment Details: {selectedShipment?.proformaInvoiceNo}</span>
            {selectedShipment && (
              <div className="flex items-center gap-2">
                <Select
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as "csv" | "pdf" | "docx" | "xlsx")}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Shipment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proforma Invoice:</span>
                      <span>{selectedShipment.proformaInvoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bill of Lading:</span>
                      <span>{selectedShipment.billOfLading}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span>{selectedShipment.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Received Date:</span>
                      <span>{new Date(selectedShipment.receivedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipment Mode:</span>
                      <span>{selectedShipment.shipmentMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={selectedShipment.deliveryStatus === "delivered" ? "text-green-800" : selectedShipment.deliveryStatus === "pending" ? "text-yellow-800" : selectedShipment.deliveryStatus === "in_transit" ? "text-blue-800" : "text-red-800"}>
                        {selectedShipment.deliveryStatus.charAt(0).toUpperCase() + selectedShipment.deliveryStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By:</span>
                      <span>{selectedShipment.createdBy?.profile.firstName} {selectedShipment.createdBy?.profile.lastName}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                    Documents
                  </h4>
                  {selectedShipment.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No documents attached to this shipment.
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
                            name: doc.qualityCheckName ?? getFileName(doc.qualityCheck),
                          },
                          doc.packingList && {
                            label: "Packing List",
                            url: doc.packingList,
                            name: doc.packingListName ?? getFileName(doc.packingList),
                          },
                          doc.insurance && {
                            label: "Insurance",
                            url: doc.insurance,
                            name: doc.insuranceName ?? getFileName(doc.insurance),
                          },
                        ].filter(Boolean) as { label: string; url: string; name: string }[];

                        return (
                          <div key={idx} className="space-y-2">
                            {entries.map((entry) => (
                              <div
                                key={entry.label}
                                className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                              >
                                <span className="text-muted-foreground">{entry.label}:</span>
                                <a
                                  href={entry.url}
                                  download={entry.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="truncate max-w-[140px]">
                                    {entry.name}
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
                      {selectedShipment.items.reduce((sum, item) => sum + (item.medicine.quantity || 0), 0)} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span>
                      ₦
                      {selectedShipment.items
                        .reduce((sum, item) => sum + (item.medicine.quantity || 0) * (item.medicine.unitCost || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Items in Shipment</h4>
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <div className="grid grid-cols-8 gap-4 p-3 bg-muted/50 text-sm font-medium">
                  <span>Medicine</span>
                  <span>Form</span>
                  <span>Manufacturer</span>
                  <span>Strength</span>
                  <span>Batch Number</span>
                  <span>Expiry Date</span>
                  <span>Quantity</span>
                  <span>Unit Cost</span>
                </div>
                {selectedShipment.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-8 gap-4 p-3 border-t text-sm">
                    <span>{item.medicine.name || "Unknown"}</span>
                    <span>{item.medicine.form || "N/A"}</span>
                    <span>{item.medicine.manufacturer || "N/A"}</span>
                    <span>{item.medicine.strength || "N/A"}</span>
                    <span className="font-mono">{item.medicine.batchNumber || "N/A"}</span>
                    <span>{item.medicine.expiryDate ? new Date(item.medicine.expiryDate).toLocaleDateString() : "N/A"}</span>
                    <span>{item.medicine.quantity || 0} units</span>
                    <span>₦{(item.medicine.unitCost || 0).toFixed(2)}</span>
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