'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  FileText,
  UserCheck,
  LogOut,
  Pill,
  Warehouse,
  Settings,
  Menu,
  Building2,
  ChevronRight,
  Plus,
  Factory,
} from 'lucide-react';
import { UserRole } from '@/types/enum';
import { User } from 'next-auth';

interface SidebarProps {
  user: User;
  activeSection: string;
  onLogout: () => void;
  onSectionChange: (section: string) => void;
}

/* ---------- Sidebar Content (shared mobile / desktop) ---------- */
const SidebarContent = ({
  user,
  activeSection,
  onLogout,
  onSectionChange,
  setIsOpen,
}: {
  user: User;
  activeSection: string;
  onLogout: () => void;
  onSectionChange: (section: string) => void;
  setIsOpen?: (open: boolean) => void;
}) => {
  const getMenuItems = () => {
    switch (user.role) {
      case UserRole.Admin: // super-admin
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'staff', label: 'Staff Management', icon: Users },
          { id: 'manufacturers', label: 'Manufacturers', icon: Factory },
          { id: 'distributors', label: 'Distributors', icon: Building2 },
          { id:  'shipments', label: 'Shipment Receiving', icon: Package },
          { id: 'stocks', label: 'Stocks', icon: Pill },
        ];
      case UserRole.Sales: // sales-admin
        return [
          { id: 'create-order', label: 'Create Order', icon: Plus },
          { id: 'orders', label: 'Orders & Payments', icon: FileText },
        ];
      case UserRole.Warehouse: // warehouse-admin
        return [
          { id: 'inventory', label: 'Inventory Management', icon: Warehouse },
          { id: 'shipments', label: 'Shipment Receiving', icon: Package },
          { id: 'stocks', label: 'Stocks', icon: Pill },
        ];
      case UserRole.Finance: // finance-admin
        return [
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'approvals', label: 'Order Approvals', icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.Admin:
        return 'text-destructive';
      case UserRole.Sales:
        return 'text-primary';
      case UserRole.Warehouse:
        return 'text-primary';
      case UserRole.Finance:
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Naxos</h2>
            <p className="text-xs text-muted-foreground">Healthcare Ltd</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-xs capitalize', getRoleColor(user.role))}>
          {user.role} Portal
        </Badge>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10 px-3 relative',
                  isActive && 'bg-primary text-primary-foreground shadow-sm font-semibold',
                  isActive && 'border-l-4 border-primary pl-2'
                )}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsOpen?.(false);
                }}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="text-sm">{item.label}</span>
                {isActive && <ChevronRight className="absolute right-3 h-4 w-4 text-primary-foreground" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Settings + User */}
      <div className="p-4 border-t border-border space-y-4">
        <Button
          variant={activeSection === 'settings' ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start h-10 px-3 relative',
            activeSection === 'settings' && 'bg-primary text-primary-foreground shadow-sm font-semibold',
            activeSection === 'settings' && 'border-l-4 border-primary pl-2'
          )}
          onClick={() => {
            onSectionChange('settings');
            setIsOpen?.(false);
          }}
        >
          <Settings className="mr-3 h-4 w-4" />
          <span className="text-sm">Settings</span>
          {activeSection === 'settings' && <ChevronRight className="absolute right-3 h-4 w-4 text-primary-foreground" />}
        </Button>

        <div className="space-y-3">
          <div className="px-3 py-2 bg-primary-foreground border border-primary/50 rounded-lg">
            <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <Button variant="outline" className="w-full h-10" onClick={() => { onLogout(); setIsOpen?.(false); }}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main Sidebar Component ---------- */
export default function Sidebar({ user, activeSection, onLogout, onSectionChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState(activeSection);

  // Sync active section with URL on mount / route change
  useEffect(() => {
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    setSection(last || 'overview');
  }, [pathname]);

  const handleSectionChange = (sec: string) => {
    setSection(sec);
    onSectionChange(sec);
    router.push(`/dashboard/${user.role}/${sec}`);
  };

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-background shadow-md">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent
              user={user}
              activeSection={section}
              onLogout={onLogout}
              onSectionChange={handleSectionChange}
              setIsOpen={setMobileOpen}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden lg:flex w-72 bg-sidebar border-r border-sidebar-border h-screen flex-col">
        <SidebarContent
          user={user}
          activeSection={section}
          onLogout={onLogout}
          onSectionChange={handleSectionChange}
        />
      </aside>
    </>
  );
}