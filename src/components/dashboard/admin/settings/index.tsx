'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, UserCheck } from "lucide-react";


export function AdminSettings() {
 
  const rolePermissionsMap = {
    admin: [
      'Full system access',
      'Manage all staff',
      'View all reports',
      'Approve orders',
      'Manage medicines',
      'System configuration'
    ],
    sales: [
      'Create orders',
      'Manage customers',
      'View stock levels',
      'Process payments',
      'Generate receipts'
    ],
    warehouse: [
      'Manage inventory',
      'Update stock levels',
      'Manage batches',
      'View stock reports',
      'Handle stock movements'
    ]
  };

  const securitySettings = [
    {
      id: 'mfa',
      title: 'Multi-Factor Authentication',
      description: 'Require 2FA for all admin users',
      enabled: true
    },
    {
      id: 'session',
      title: 'Session Timeout',
      description: 'Auto-logout after 30 minutes of inactivity',
      enabled: true
    },
    {
      id: 'password',
      title: 'Strong Password Policy',
      description: 'Enforce complex passwords for all users',
      enabled: true
    },
    {
      id: 'login',
      title: 'Login Attempt Limiting',
      description: 'Lock accounts after 5 failed login attempts',
      enabled: false
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and security settings
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
         <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissionsMap).map(([role, permissions]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center capitalize">
                    <Shield className="mr-2 h-5 w-5" />
                    {role} Role
                  </CardTitle>
                  <CardDescription>
                    Permissions and access levels for {role} users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Modify Permissions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of all permissions across different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Permission</th>
                      <th className="text-center p-2">Admin</th>
                      <th className="text-center p-2">Sales</th>
                      <th className="text-center p-2">Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Manage Staff</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">View Reports</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">📊</td>
                      <td className="text-center p-2">📊</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Create Orders</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Manage Inventory</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">👁️</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>✅ Full Access | 👁️ View Only | 📊 Limited Access | ❌ No Access</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Configure system-wide security settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{setting.title}</h4>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}