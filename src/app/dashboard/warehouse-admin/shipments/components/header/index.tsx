import { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  setIsAddDialogOpen: (open: boolean) => void;
}

export default function Header({ setIsAddDialogOpen }: HeaderProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Shipment Receiving</h1>
        <p className="text-muted-foreground">
          Upload proforma invoices, BOL documents, and record batch details
        </p>
      </div>
      <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        New Shipment
      </Button>
    </div>
  );
}