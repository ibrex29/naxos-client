/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPlus, Edit, ToggleLeft, ToggleRight, Users, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { UserQueryParams, User } from '@/app/api/service/userService';
import { useUsers, useUserManagement, useStaffSummary } from '@/hooks/use-users';
import { UserRole } from '@/types/enum';

interface FormData {
  fullname: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
  isActive: boolean;
}

interface StaffStatsProps {
  stats: {
    total: number;
    administrators: number;
    salesStaff: number;
    warehouseStaff: number;
    financeStaff: number;
  };
  isLoading: boolean;
}

interface StaffTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  mutationLoading: boolean;
}

interface StaffFilterProps {
  onSearch: (searchTerm: string) => void;
  onRoleFilter: (role: string) => void;
  onStatusFilter: (status: string) => void;
}

const StaffStats: React.FC<StaffStatsProps> = ({ stats, isLoading }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    {[
      { title: 'Total Staff', count: stats.total, icon: Users },
      { title: 'Administrators', count: stats.administrators, icon: Shield, iconClass: 'text-destructive' },
      { title: 'Sales Staff', count: stats.salesStaff, icon: Users, iconClass: 'text-primary' },
      { title: 'Warehouse Staff', count: stats.warehouseStaff, icon: Users, iconClass: 'text-muted-foreground' },
      { title: 'Finance Staff', count: stats.financeStaff, icon: Users, iconClass: 'text-muted-foreground' },
    ].map((stat, index) => (
      <Card key={index}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          <stat.icon className={`h-4 w-4 ${stat.iconClass || 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton height={24} width={40} /> : stat.count}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StaffFilter: React.FC<StaffFilterProps> = ({ onSearch, onRoleFilter, onStatusFilter }) => (
  <div className="flex flex-col md:flex-row gap-4">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          className="pl-8 rounded-md border border-gray-300 focus:border-blue-500"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
    <div className="flex gap-4">
      <Select onValueChange={onRoleFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {['super-admin', 'admin', 'sales-admin', 'warehouse-admin', 'finance-admin'].map((role) => (
            <SelectItem key={role} value={role}>
              {role.replace('-', ' ').toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={onStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

const StaffTable: React.FC<StaffTableProps> = ({ users, isLoading, onEdit, onToggleStatus, mutationLoading }) => {
  const [popoverUserId, setPopoverUserId] = useState<string | null>(null);

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'> = {
      'super-admin': 'outline',
      admin: 'destructive',
      'sales-admin': 'default',
      'warehouse-admin': 'secondary',
      'finance-admin': 'outline',
    };
    return variants[role] || 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>Manage your staff and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton height={20} width={150} /></TableCell>
                  <TableCell><Skeleton height={20} width={200} /></TableCell>
                  <TableCell><Skeleton height={20} width={100} /></TableCell>
                  <TableCell><Skeleton height={20} width={120} /></TableCell>
                  <TableCell><Skeleton height={20} width={80} /></TableCell>
                  <TableCell><Skeleton height={20} width={100} /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No staff members found</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.code || ''}</TableCell>
                  <TableCell>{`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.profile?.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPopoverUserId(user.id)}
                          >
                            {user.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                          </Button>
                        </PopoverTrigger>
                        {popoverUserId === user.id && (
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  {user.isActive ? 'Deactivate' : 'Activate'} Staff Member
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} this staff member?
                                </p>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPopoverUserId(null)}
                                  disabled={mutationLoading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant={user.isActive ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={() => onToggleStatus(user.id, user.isActive)}
                                  disabled={mutationLoading}
                                >
                                  {mutationLoading ? 'Processing...' : user.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const StaffForm: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isLoading: boolean;
}> = ({ formData, setFormData, onSubmit, onCancel, isEditMode = false, isLoading }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="fullname">Full Name *</Label>
      <Input
        id="fullname"
        value={formData.fullname}
        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
        placeholder="Enter full name"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>
    </div>
    {!isEditMode && (
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter password"
        />
      </div>
    )}
    <div className="space-y-2">
      <Label>Role</Label>
      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['super-admin', 'admin', 'sales-admin', 'warehouse-admin', 'finance-admin'].map((role) => (
            <SelectItem key={role} value={role}>
              {role.replace('-', ' ').toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Status</Label>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
        />
        <Label htmlFor="isActive" className="text-sm font-medium">
          Active
        </Label>
      </div>
    </div>
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={isLoading}>
        {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Staff' : 'Add Staff'}
      </Button>
    </div>
  </div>
);

const StaffManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    email: '',
    role: UserRole.Sales,
    phone: '',
    password: '',
    isActive: true,
  });
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
    search: '',
    role: '',
    isActive: undefined,
  });

  const { data: usersResponse, isLoading, error, refetch } = useUsers(queryParams);
  const { data: staffSummary, isLoading: isSummaryLoading, error: summaryError } = useStaffSummary();
  const { createUser, updateUser, activateUser, deactivateUser, isLoading: mutationLoading } = useUserManagement();

  const users = useMemo(() => usersResponse?.data || [], [usersResponse?.data]);
  const pagination = useMemo(
    () => usersResponse?.meta || { page: 1, limit: 10, itemCount: 0, pageCount: 1, hasPreviousPage: false, hasNextPage: false },
    [usersResponse?.meta]
  );
  const stats = useMemo(
    () => staffSummary || { total: 0, administrators: 0, salesStaff: 0, warehouseStaff: 0, financeStaff: 0 },
    [staffSummary]
  );

  const resetForm = useCallback(() => {
    setFormData({
      fullname: '',
      email: '',
      role: UserRole.Sales,
      phone: '',
      password: '',
      isActive: true,
    });
  }, []);

  const handleAddStaff = useCallback(async () => {
    if (!formData.fullname || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createUser.mutateAsync({
        fullname: formData.fullname,
        email: formData.email,
        role: formData.role,
        phoneNumber: formData.phone,
        password: formData.password,
      });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Staff member added successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    }
  }, [formData, createUser, refetch, resetForm]);

  const handleEditStaff = useCallback(async () => {
    if (!selectedUser || !formData.fullname || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateUser.mutateAsync({
        userId: selectedUser.id,
        userData: {
          fullname: formData.fullname,
          email: formData.email,
          role: formData.role,
          phoneNumber: formData.phone,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success('Staff member updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update staff member');
    }
  }, [formData, selectedUser, updateUser, refetch, resetForm]);

  const handleToggleStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      try {
        if (isActive) {
          await deactivateUser.mutateAsync(userId);
          toast.success('Staff member deactivated successfully');
        } else {
          await activateUser.mutateAsync(userId);
          toast.success('Staff member activated successfully');
        }
        refetch();
      } catch (error) {
        toast.error(`Failed to ${isActive ? 'deactivate' : 'activate'} staff member`);
      }
    },
    [activateUser, deactivateUser, refetch]
  );

  const openEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setFormData({
      fullname: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      email: user.email,
      role: user.role as UserRole,
      phone: user.profile?.phone || '',
      password: '',
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setQueryParams((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((role: string) => {
    setQueryParams((prev) => ({ ...prev, role: role === 'all' ? '' : role, page: 1 }));
  }, []);

  const handleActiveFilter = useCallback((isActive: string) => {
    setQueryParams((prev) => ({
      ...prev,
      isActive: isActive === 'all' ? undefined : isActive === 'active',
      page: 1,
    }));
  }, []);

  const handlePagination = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  if (error || summaryError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">
            Error loading data: {error?.message || summaryError?.message}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members and roles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Create a new staff account with appropriate role</DialogDescription>
            </DialogHeader>
            <StaffForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddStaff}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={mutationLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <StaffStats stats={stats} isLoading={isSummaryLoading} />
      <StaffFilter onSearch={handleSearch} onRoleFilter={handleFilterChange} onStatusFilter={handleActiveFilter} />
      <StaffTable
        users={users}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onToggleStatus={handleToggleStatus}
        mutationLoading={mutationLoading}
      />

      {pagination.pageCount > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.itemCount)} of {pagination.itemCount} staff
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePagination(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePagination(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff account details and role</DialogDescription>
          </DialogHeader>
          <StaffForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditStaff}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedUser(null);
            }}
            isEditMode
            isLoading={mutationLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;