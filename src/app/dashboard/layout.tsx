'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Newspaper,
  LogOut,
  HandCoins,
  Home,
  GraduationCap,
  Menu,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useSession, signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign-in if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const navItems = [
    { title: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { title: 'Sluk Connect', href: '/dashboard/admin/sluk-connect', icon: Users },
    { title: 'Users', href: '/dashboard/admin/users', icon: Users },
    { title: 'Events', href: '/dashboard/admin/events', icon: Calendar },
    { title: 'Donations', href: '/dashboard/admin/donations', icon: HandCoins },
    { title: 'Announcements', href: '/dashboard/admin/announcements', icon: Newspaper },
    { title: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center mb-6 px-4">
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-gradient-hero">
            <span className="text-accent">SLU</span> Alumni
          </span>
        </Link>
      </div>

      {/* Profile Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 mx-4">
        {status === 'loading' ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : session?.user ? (
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 text-sm">
              <AvatarFallback>
                {`${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {session.user.firstName} {session.user.lastName}
              </div>
              <div className="text-xs text-gray-600 truncate max-w-[150px]">
                {session.user.email}
              </div>
              <div className="text-xs text-blue-500 capitalize">{session.user.role}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 text-sm">No user data</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 p-2 rounded-md mb-2 transition-colors',
                isActive
                  ? 'bg-blue-100 text-primary font-medium'
                  : 'text-gray-900 hover:bg-blue-50 hover:text-primary'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4">
        <Button
          variant="outline"
          className="w-full border-gray-200 text-gray-900 hover:bg-blue-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sonner />
      {/* Fixed Sidebar (Desktop) */}
      <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mb-4">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-200 text-gray-900 hover:bg-blue-50"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-white border-r border-gray-200 p-0"
            >
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className="max-w-7xl mx-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}