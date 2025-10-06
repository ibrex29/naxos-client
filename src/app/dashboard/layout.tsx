'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/sidebar";
import { UserRole } from "@/types/enum";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Get user from session
  const user = session?.user;

  // Initialize active section based on role
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.push("/signin");
      return;
    }

    switch (user.role as UserRole) {
      case UserRole.Sales:
        setActiveSection("pos");
        break;
      case UserRole.Warehouse:
        setActiveSection("inventory");
        break;
      default:
        setActiveSection("overview");
    }
  }, [status, user, router]);

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/signin" });
  };

  if (status === "loading") {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} activeSection={activeSection} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
