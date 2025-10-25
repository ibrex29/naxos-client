/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, FileText, Truck, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Shipment, DeliveryStatus } from '@/app/api/service/shipmentService';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from 'docx';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck as TruckIcon } from 'lucide-react';

// Interfaces
interface ShipmentListProps {
  shipments: Shipment[];
  meta: { itemCount: number; page: number; limit: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean };
  isLoading: boolean;
  setSelectedShipment: (shipment: Shipment | null) => void;
  exportFormat: 'csv' | 'pdf' | 'docx' | 'xlsx';
  setExportFormat: (value: 'csv' | 'pdf' | 'docx' | 'xlsx') => void;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
}

interface ShipmentCardProps {
  shipment: Shipment;
  getStatusBadge: (status: DeliveryStatus) => JSX.Element;
  getCustomClasses: (status: DeliveryStatus) => string;
  setSelectedShipment: (shipment: Shipment) => void;
  exportFormat: 'csv' | 'pdf' | 'docx' | 'xlsx';
  setExportFormat: (value: 'csv' | 'pdf' | 'docx' | 'xlsx') => void;
  onExport: (shipment: Shipment) => void;
}

interface ShipmentPaginationProps {
  meta: ShipmentListProps['meta'];
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
}

// Utility Functions
const getStatusBadge = (status: DeliveryStatus): JSX.Element => {
  switch (status) {
    case 'delivered':
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge variant="default">
          <TruckIcon className="h-3 w-3 mr-1" />
          In Transit
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getCustomClasses = (status: DeliveryStatus): string => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_transit': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-muted text-muted-foreground';
  }
};

const exportShipmentData = (shipment: Shipment, exportFormat: 'csv' | 'pdf' | 'docx' | 'xlsx') => {
  const fileName = `shipment-${shipment.id}`;
  const headers = [
    'Medicine',
    'Form',
    'Manufacturer',
    'Strength',
    'Batch Number',
    'Expiry Date',
    'Quantity',
    'Unit Cost',
    'Unit Cost To Be Sold',
    'Shipment Mode',
  ];
  const data = shipment.items.map((item) => [
    item.medicine.name || 'Unknown',
    item.medicine.form || 'N/A',
    item.medicine.manufacturer || 'N/A',
    item.medicine.strength || 'N/A',
    item.medicine.batchNumber || 'N/A',
    item.medicine.expiryDate || 'N/A',
    item.medicine.quantity || 0,
    item.medicine.unitCost || 0,
    item.medicine.unitCostToBeSold || 'N/A',
    shipment.shipmentMode,
  ]);

  switch (exportFormat) {
    case 'csv': {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        headers.join(',') +
        '\n' +
        data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
    }
    case 'pdf': {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Shipment: ${shipment.proformaInvoiceNo}`, 20, 20);
      doc.setFontSize(12);
      doc.text(`Supplier: ${shipment.supplier}`, 20, 30);
      doc.text(`Received Date: ${new Date(shipment.receivedDate).toLocaleDateString()}`, 20, 40);
      doc.text(`Shipment Mode: ${shipment.shipmentMode}`, 20, 50);
      (doc as any).autoTable({
        head: [headers],
        body: data.map((row) => row.map((cell) => String(cell))),
        startY: 60,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      doc.save(`${fileName}.pdf`);
      break;
    }
    case 'docx': {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: `Shipment: ${shipment.proformaInvoiceNo}`, heading: 'Heading1' }),
              new Paragraph(`Supplier: ${shipment.supplier}`),
              new Paragraph(`Received Date: ${new Date(shipment.receivedDate).toLocaleDateString()}`),
              new Paragraph(`Shipment Mode: ${shipment.shipmentMode}`),
              new Paragraph({ text: '', spacing: { after: 200 } }),
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
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      break;
    }
    case 'xlsx': {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Shipment');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      break;
    }
    default:
      toast.error('Unsupported export format');
  }
};

// Sub-components
const ShipmentCard: React.FC<ShipmentCardProps> = ({
  shipment,
  getStatusBadge,
  getCustomClasses,
  setSelectedShipment,
  exportFormat,
  setExportFormat,
  onExport,
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {shipment.proformaInvoiceNo}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Supplier: {shipment.supplier}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadge(shipment.deliveryStatus).props.variant} className={getCustomClasses(shipment.deliveryStatus)}>
            {getStatusBadge(shipment.deliveryStatus).props.children}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedShipment(shipment)}
          >
            View Details
          </Button>
          <div className="flex items-center gap-2">
            <Select
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'csv' | 'pdf' | 'docx' | 'xlsx')}
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
              onClick={() => onExport(shipment)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>BOL: {shipment.billOfLading}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Received: {new Date(shipment.receivedDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{shipment.items.length} item(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>Mode: {shipment.shipmentMode}</span>
        </div>
      </div>
      {shipment.items.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Items:</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
            {shipment.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between bg-muted/30 rounded p-2">
                <span>{item.medicine.name || 'Unknown'} ({item.medicine.form || 'N/A'})</span>
                <span className="text-muted-foreground">
                  {item.medicine.quantity || 0} units | Batch: {item.medicine.batchNumber || 'N/A'}
                </span>
              </div>
            ))}
            {shipment.items.length > 3 && (
              <div className="text-muted-foreground text-xs">
                +{shipment.items.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const ShipmentPagination: React.FC<ShipmentPaginationProps> = ({ meta, page, setPage }) => (
  <div className="flex justify-between items-center mt-4">
    <div className="text-sm text-muted-foreground">
      Showing {meta.page * meta.limit - meta.limit + 1} to{' '}
      {Math.min(meta.page * meta.limit, meta.itemCount)} of {meta.itemCount} shipments
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
);

const NoShipmentsMessage: React.FC = () => (
  <Card>
    <CardContent className="p-12 text-center">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No shipments found</h3>
      <p className="text-muted-foreground mb-4">
        Start by recording your first shipment
      </p>
      {/* Note: Add button to open add shipment dialog if provided in props */}
      {/* <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Record Shipment
      </Button> */}
    </CardContent>
  </Card>
);

// Main Component
export default function ShipmentList({
  shipments,
  meta,
  isLoading,
  setSelectedShipment,
  exportFormat,
  setExportFormat,
  page,
  setPage,
}: ShipmentListProps): JSX.Element {
  const handleExport = useCallback((shipment: Shipment) => {
    exportShipmentData(shipment, exportFormat);
  }, [exportFormat]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-4 pt-4 border-t">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <ShipmentPagination meta={meta} page={page} setPage={setPage} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.length === 0 ? (
        <NoShipmentsMessage />
      ) : (
        <>
          {shipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              getStatusBadge={getStatusBadge}
              getCustomClasses={getCustomClasses}
              setSelectedShipment={setSelectedShipment}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              onExport={handleExport}
            />
          ))}
          <ShipmentPagination meta={meta} page={page} setPage={setPage} />
        </>
      )}
    </div>
  );
}