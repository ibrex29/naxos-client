"use client";
import StatsCards from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Activity,
  Newspaper,
  HandCoins,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data for stats
  const dashboardStats = {
    totalUsers: 1250,
    totalAlumni: 980,
    totalStaff: 45,
    totalAdmins: 8,
    activeUsers: 1100,
    newThisMonth: 23,
    totalDonations: 125000,
    totalEvents: 12,
    upcomingEvents: 3,
  };

  // Mock recent activity data
  const recentActivity = [
    { id: "1", description: "John Doe registered as an alumni", timestamp: "2024-03-15 10:30 AM" },
    { id: "2", description: "Annual Homecoming event created", timestamp: "2024-03-14 2:15 PM" },
    { id: "3", description: "Sarah Johnson donated $500 to Library Renovation", timestamp: "2024-03-14 9:00 AM" },
    { id: "4", description: "AI Research Initiative article published", timestamp: "2024-03-13 4:45 PM" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

       {/* Stats Cards */}
            <StatsCards dashboardStats={dashboardStats}/>

      {/* Recent Activity */}
      <Card className="bg-white border-gray-200 mb-8">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-600">Latest actions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{activity.description}</div>
                  <div className="text-sm text-gray-600">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Links</CardTitle>
          <CardDescription className="text-gray-600">Access key admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
            </Link>
            <Link href="/admin/donations">
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                <HandCoins className="w-4 h-4 mr-2" />
                Manage Donations
              </Button>
            </Link>
            <Link href="/admin/content">
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                <Newspaper className="w-4 h-4 mr-2" />
                Manage Content
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}