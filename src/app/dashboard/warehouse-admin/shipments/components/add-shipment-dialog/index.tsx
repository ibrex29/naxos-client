import { JSX, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Scan, Search } from "lucide-react";
import FileUpload from "@/components/file-upload";
import { ShipmentItem, ShipmentMode, MedicineFormEnum } from "@/app/api/service/shipmentService";
import toast from "react-hot-toast";
import { Manufacturer } from "@/app/api/service/manufacturerService";

interface AddShipmentDialogProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  formData: {
    proformaInvoiceNo: string;
    billOfLading: string;
    supplier: string;
    receivedDate: string;
    shipmentMode: ShipmentMode;
  };
  setFormData: (data: {
    proformaInvoiceNo: string;
    billOfLading: string;
    supplier: string;
    receivedDate: string;
    shipmentMode: ShipmentMode;
  }) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  newShipmentItems: ShipmentItem[];
  setNewShipmentItems: (items: ShipmentItem[]) => void;
  invoiceDoc: Array<{ url: string; fileName: string }>;
  setInvoiceDoc: Dispatch<SetStateAction<Array<{ url: string; fileName: string }>>>;
  qualityCheck: Array<{ url: string; fileName: string }>;
  setQualityCheck: Dispatch<SetStateAction<Array<{ url: string; fileName: string }>>>;
  packingList: Array<{ url: string; fileName: string }>;
  setPackingList: Dispatch<SetStateAction<Array<{ url: string; fileName: string }>>>;
  insurance: Array<{ url: string; fileName: string }>;
  setInsurance: Dispatch<SetStateAction<Array<{ url: string; fileName: string }>>>;
  manufacturers: Manufacturer[];
  isManufacturersLoading: boolean;
  manufacturerSearch: string;
  setManufacturerSearch: (value: string) => void;
  manufacturerMeta: { page: number; limit: number; itemCount: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean };
  setManufacturerPage: (page: number | ((prev: number) => number)) => void;
  handleRecordShipment: () => Promise<void>;
  isCreating: boolean;
}

export default function AddShipmentDialog({
  isAddDialogOpen,
  setIsAddDialogOpen,
  formData,
  setFormData,
  handleInputChange,
  newShipmentItems,
  setNewShipmentItems,
  setInvoiceDoc,
  setQualityCheck,
  setPackingList,
  setInsurance,
  manufacturers,
  isManufacturersLoading,
  manufacturerSearch,
  setManufacturerSearch,
  manufacturerMeta,
  setManufacturerPage,
  handleRecordShipment,
  isCreating,
}: AddShipmentDialogProps): JSX.Element {
  const addShipmentItem = () => {
    setNewShipmentItems([
      ...newShipmentItems,
      {
        medicine: {
          name: "",
          form: MedicineFormEnum.CAPSULE,
          manufacturerId: "",
          strength: "",
          manufacturingDate: "",
          packSize: 0,
          batchNumber: "",
          expiryDate: "",
          unitType: "",
          quantity: 0,
          unitCost: 0,
          unitCostToBeSold: 0,
        },
      },
    ]);
  };

  const removeShipmentItem = (index: number) => {
    setNewShipmentItems(newShipmentItems.filter((_, i) => i !== index));
  };

  const updateShipmentItem = (
    index: number,
    field: keyof ShipmentItem["medicine"],
    value: string | number | MedicineFormEnum
  ) => {
    const updated = [...newShipmentItems];
    updated[index] = {
      ...updated[index],
      medicine: {
        ...updated[index].medicine,
        [field]: value,
      },
    };
    setNewShipmentItems(updated);
    if (field === "name") {
      toast.success(`Medicine name set to: ${value}`);
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Shipment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proformaInvoiceNo">Proforma Invoice Number</Label>
              <Input
                id="proformaInvoiceNo"
                placeholder="PI-2024-XXX"
                value={formData.proformaInvoiceNo}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billOfLading">Bill of Lading</Label>
              <Input
                id="billOfLading"
                placeholder="BL-NGS-XXXXXX-XXX"
                value={formData.billOfLading}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="Supplier name"
                value={formData.supplier}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Received Date</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipmentMode">Shipment Mode</Label>
              <Select
                value={formData.shipmentMode}
                onValueChange={(value) => setFormData({ ...formData, shipmentMode: value as ShipmentMode })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIR">Air</SelectItem>
                  <SelectItem value="SEA">Sea</SelectItem>
                  <SelectItem value="LAND">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Document</Label>
                <FileUpload
                  id="invoice-upload"
                  onFilesChange={setInvoiceDoc}
                  label="Upload invoice document (PDF, images, or Word documents)"
                  multiple={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Quality Check Document</Label>
                <FileUpload
                  id="quality-check-upload"
                  onFilesChange={setQualityCheck}
                  label="Upload quality check document (PDF, images, or Word documents)"
                  multiple={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Packing List Document</Label>
                <FileUpload
                  id="packing-list-upload"
                  onFilesChange={setPackingList}
                  label="Upload packing list document (PDF, images, or Word documents)"
                  multiple={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance Document</Label>
                <FileUpload
                  id="insurance-upload"
                  onFilesChange={setInsurance}
                  label="Upload insurance document (PDF, images, or Word documents)"
                  multiple={false}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Shipment Items</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="gap-2"
                >
                  <Scan className="h-4 w-4" />
                  Scan Barcode
                </Button>
                <Button variant="outline" size="sm" onClick={addShipmentItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {newShipmentItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items added yet</p>
                  <Button variant="outline" onClick={addShipmentItem} className="mt-4">
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {newShipmentItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Medicine</Label>
                          <Input
                            placeholder="Enter medicine name"
                            value={item.medicine.name || ""}
                            onChange={(e) => updateShipmentItem(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Form</Label>
                          <Select
                            value={item.medicine.form || MedicineFormEnum.CAPSULE}
                            onValueChange={(value) => updateShipmentItem(index, "form", value as MedicineFormEnum)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select form" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(MedicineFormEnum).map((form) => (
                                <SelectItem key={form} value={form}>
                                  {form}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Manufacturer</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Search manufacturers..."
                              value={manufacturerSearch}
                              onChange={(e) => setManufacturerSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Select
                            value={item.medicine.manufacturerId || ""}
                            onValueChange={(value) => updateShipmentItem(index, "manufacturerId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select manufacturer" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {isManufacturersLoading ? (
                                <div className="p-2">Loading manufacturers...</div>
                              ) : (
                                <>
                                  {manufacturers.map((manufacturer) => (
                                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                                      {manufacturer.name} ({manufacturer.code})
                                    </SelectItem>
                                  ))}
                                  {manufacturerMeta.hasNextPage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setManufacturerPage((prev) => prev + 1)}
                                      className="w-full"
                                    >
                                      Load More
                                    </Button>
                                  )}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Strength</Label>
                          <Input
                            placeholder="Enter strength (e.g., 250mg)"
                            value={item.medicine.strength || ""}
                            onChange={(e) => updateShipmentItem(index, "strength", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Batch Number</Label>
                          <Input
                            placeholder="Batch #"
                            value={item.medicine.batchNumber || ""}
                            onChange={(e) => updateShipmentItem(index, "batchNumber", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={item.medicine.expiryDate || ""}
                            onChange={(e) => updateShipmentItem(index, "expiryDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.medicine.quantity || 0}
                            onChange={(e) => updateShipmentItem(index, "quantity", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Cost (₦)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.medicine.unitCost || 0}
                            onChange={(e) => updateShipmentItem(index, "unitCost", parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Cost to be Sold (₦)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.medicine.unitCostToBeSold || 0}
                            onChange={(e) => updateShipmentItem(index, "unitCostToBeSold", parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Manufacturing Date</Label>
                          <Input
                            type="date"
                            value={item.medicine.manufacturingDate || ""}
                            onChange={(e) => updateShipmentItem(index, "manufacturingDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pack Size</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.medicine.packSize || 0}
                            onChange={(e) => updateShipmentItem(index, "packSize", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Type</Label>
                          <Select
                            value={item.medicine.unitType || "CARTON"}
                            onValueChange={(value) => updateShipmentItem(index, "unitType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CARTON">CARTON</SelectItem>
                              <SelectItem value="BOX">BOX</SelectItem>
                              <SelectItem value="BOTTLE">BOTTLE</SelectItem>
                              <SelectItem value="UNIT">UNIT</SelectItem>
                              <SelectItem value="SACHET">SACHET</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:row-span-2 flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeShipmentItem(index)}
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordShipment} disabled={newShipmentItems.length === 0 || isCreating}>
              {isCreating ? "Recording..." : "Record Shipment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}