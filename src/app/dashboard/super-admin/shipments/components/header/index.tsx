import { JSX } from "react";

export default function Header(): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Shipment Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage shipments, update statuses, and view details
        </p>
      </div>
    </div>
  );
}