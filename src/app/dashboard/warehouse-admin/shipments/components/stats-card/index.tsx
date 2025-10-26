import { JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { ShipmentDisplay } from "@/types/shipment";

interface StatsCardsProps {
  shipments: ShipmentDisplay[];
  meta: { itemCount: number; page: number; limit: number; pageCount: number; hasPreviousPage: boolean; hasNextPage: boolean };
}

export default function StatsCards({ shipments, meta }: StatsCardsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Shipments</p>
              <p className="text-xl font-semibold">{meta.itemCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold">
                {shipments.filter((s) => s.deliveryStatus === "pending").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-xl font-semibold">
                {shipments.filter((s) => s.deliveryStatus === "delivered").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-xl font-semibold">
                {shipments.filter(
                  (s) => new Date(s.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}