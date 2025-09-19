'use client';

import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import {
  BarChart3,
  Users,
  Pill,
  FileText,
  Settings,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar = ({ userRole, activeSection, onSectionChange, onLogout }: SidebarProps) => {
  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "medicines", label: "Medicine Master", icon: Pill },
    { id: "reports", label: "Reports & Analytics", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const salesMenuItems = [
    { id: "pos", label: "Point of Sale", icon: ShoppingCart },
    { id: "orders", label: "Order History", icon: FileText },
    { id: "customers", label: "Customer Management", icon: Users },
    { id: "stock-check", label: "Stock Availability", icon: Package },
  ];

  const warehouseMenuItems = [
    { id: "inventory", label: "Inventory Overview", icon: Package },
    { id: "stock-inward", label: "Stock Inward", icon: TrendingUp },
    { id: "alerts", label: "Stock Alerts", icon: AlertTriangle },
    { id: "reports", label: "Stock Reports", icon: FileText },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return adminMenuItems;
      case "sales":
        return salesMenuItems;
      case "warehouse":
        return warehouseMenuItems;
      default:
        return [];
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case "admin":
        return "Admin Portal";
      case "sales":
        return "Sales Portal";
      case "warehouse":
        return "Warehouse Portal";
      default:
        return "Portal";
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">PharmaCare ERP</h2>
        <p className="text-sm text-muted-foreground mt-1">{getRoleTitle()}</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <Button
                variant={activeSection === id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeSection === id && "bg-primary text-primary-foreground"
                )}
                onClick={() => onSectionChange(id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Switch Role
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;