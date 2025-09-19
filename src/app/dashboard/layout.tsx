'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserRole } from "@/types";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { role } = useParams();
  const selectedRole = role as UserRole;
  const [activeSection, setActiveSection] = useState<string>(() => {
    switch (selectedRole) {
      case "sales":
        return "pos";
      case "warehouse":
        return "inventory";
      default:
        return "dashboard";
    }
  });

  const handleLogout = () => {
    router.push("/");
  };

  if (!selectedRole) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        userRole={selectedRole}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}