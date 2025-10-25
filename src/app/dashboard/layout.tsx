'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/layout/sidebar';
import { UserRole } from '@/types/enum';
import { User } from 'next-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const user = session?.user as User | undefined;
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'loading') return;

    if (!user) {
      router.replace('/signin');
      return;
    }

    // Set default section based on role
    const role = user.role as UserRole;
    switch (role) {
      case UserRole.Sales:
        setActiveSection('pos');
        break;
      case UserRole.Warehouse:
        setActiveSection('inventory');
        break;
      default:
        setActiveSection('overview');
    }
  }, [status, user, router]);

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/signin' });
  };

  if (status === 'loading') return <div className="p-6">Loading…</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={user}
        activeSection={activeSection}
        onLogout={handleLogout}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}