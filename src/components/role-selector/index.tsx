'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { Shield, ShoppingCart, Package } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  const roles = [
    {
      role: "admin" as UserRole,
      title: "Admin Dashboard",
      description: "Manage staff, medicines, and view analytics",
      icon: Shield,
      color: "primary",
    },
    {
      role: "sales" as UserRole,
      title: "Sales Dashboard",
      description: "Point of sale and customer management",
      icon: ShoppingCart,
      color: "success",
    },
    {
      role: "warehouse" as UserRole,
      title: "Warehouse Dashboard",
      description: "Inventory management and stock tracking",
      icon: Package,
      color: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            PharmaCare ERP
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to access the dashboard
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ role, title, description, icon: Icon, color }) => (
            <Card key={role} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div
                  className={`mx-auto w-16 h-16 rounded-full bg-${color}/10 flex items-center justify-center mb-4 group-hover:bg-${color}/20 transition-colors`}
                >
                  <Icon className={`w-8 h-8 text-${color}`} />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={color === "primary" ? "default" : "outline"}
                  onClick={() => onRoleSelect(role)}
                >
                  Access Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;