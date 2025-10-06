'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers } from "@/data/mockData";
import { User } from "@/types";
import { Search, Shield, Key, UserCheck, Settings, AlertCircle } from 'lucide-react';

export function AdminSettings() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (userId: string) => {
    console.log('Toggle user status for:', userId);
  };

  const resetUserPassword = (userId: string) => {
    console.log('Reset password for:', userId);
  };

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
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>View and manage all user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="sales">Sales Staff</SelectItem>
                    <SelectItem value="warehouse">Warehouse Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'admin' ? 'destructive' :
                          user.role === 'sales' ? 'default' : 'secondary'
                        } className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => resetUserPassword(user.id)}>
                            <Key className="h-4 w-4 mr-1" />
                            Reset Password
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleUserStatus(user.id)}>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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

          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>
                Recent user login and activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Admin</TableCell>
                    <TableCell>Login</TableCell>
                    <TableCell>192.168.1.100</TableCell>
                    <TableCell>2024-09-19 10:30:15</TableCell>
                    <TableCell><Badge variant="default">Success</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sarah Sales</TableCell>
                    <TableCell>Order Creation</TableCell>
                    <TableCell>192.168.1.101</TableCell>
                    <TableCell>2024-09-19 10:25:42</TableCell>
                    <TableCell><Badge variant="default">Success</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unknown User</TableCell>
                    <TableCell>Failed Login</TableCell>
                    <TableCell>203.0.113.45</TableCell>
                    <TableCell>2024-09-19 10:15:33</TableCell>
                    <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm">
                  <strong>Recommendation:</strong> Enable multi-factor authentication for all admin accounts to enhance security.
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">
                  <strong>Info:</strong> Regular security audits should be conducted monthly to ensure compliance.
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm">
                  <strong>Good:</strong> Password policy is currently enforced for all user accounts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}