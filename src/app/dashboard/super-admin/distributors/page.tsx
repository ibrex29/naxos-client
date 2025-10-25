/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Distributor, DistributorQueryParams, DistributorType } from '@/app/api/service/distributorService';
import { useDistributors, useDistributorAnalytics, useDistributorManagement } from '@/hooks/use-distributors';

// Interfaces
interface FormData {
  name: string;
  type: DistributorType;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  currency: string;
}

interface DistributorStatsProps {
  stats: {
    totalDistributors: number;
    activeDistributors: number;
    totalSales: number;
    byType: Record<string, { total: number }>;
  };
  isLoading: boolean;
}

interface DistributorTableProps {
  distributors: Distributor[];
  isLoading: boolean;
  onView: (distributor: Distributor) => void;
  onEdit: (distributor: Distributor) => void;
}

interface DistributorFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
  submitText: string;
}

interface DistributorFiltersProps {
  onSearch: (searchTerm: string) => void;
  onTypeFilter: (type: string) => void;
}

interface DistributorDetailsProps {
  distributor: Distributor;
  getTypeIcon: (type: string) => string;
  getTypeBadge: (type: string) => 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';
  getCustomClasses: (type: string) => string;
}

// Utility Functions
const getTypeIcon = (type: string): string => {
  switch (type) {
    case DistributorType.Hospital: return '🏥';
    case DistributorType.Pharmacy: return '💊';
    case DistributorType.Clinic: return '🩺';
    case DistributorType.Wholesaler: return '🏪';
    case DistributorType.NGO: return '🤝';
    case DistributorType.Chemist: return '⚗️';
    default: return '🏢';
  }
};

const getTypeBadge = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'> = {
    [DistributorType.Hospital]: 'default',
    [DistributorType.Pharmacy]: 'secondary',
    [DistributorType.Clinic]: 'outline',
    [DistributorType.Wholesaler]: 'warning',
    [DistributorType.NGO]: 'secondary',
    [DistributorType.Chemist]: 'outline',
  };
  return variants[type] || 'outline';
};

const getCustomClasses = (type: string): string => {
  const classes: Record<string, string> = {
    [DistributorType.Hospital]: 'bg-blue-100 text-blue-800',
    [DistributorType.Pharmacy]: 'bg-green-100 text-green-800',
    [DistributorType.Clinic]: 'bg-purple-100 text-purple-800',
    [DistributorType.Wholesaler]: 'bg-yellow-100 text-yellow-800',
    [DistributorType.NGO]: 'bg-gray-100 text-gray-800',
    [DistributorType.Chemist]: 'bg-indigo-100 text-indigo-800',
  };
  return classes[type] || 'bg-muted text-muted-foreground';
};

// Sub-components
const DistributorStats: React.FC<DistributorStatsProps> = ({ stats, isLoading }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {[
      { title: 'Total Distributors', count: stats.totalDistributors, icon: Building2, iconClass: 'text-primary' },
      { title: 'Active Distributors', count: stats.activeDistributors, icon: Users, iconClass: 'text-success' },
      { title: 'Hospitals', count: stats.byType.HOSPITAL?.total || 0, icon: () => <span className="text-lg">🏥</span>, iconClass: '' },
      { title: 'Pharmacies', count: stats.byType.PHARMACY?.total || 0, icon: () => <span className="text-lg">💊</span>, iconClass: '' },
      { title: 'Clinics', count: stats.byType.CLINIC?.total || 0, icon: () => <span className="text-lg">🩺</span>, iconClass: '' },
      { title: 'Total Sales', count: `₦${(stats.totalSales / 1000000).toFixed(1)}M`, icon: TrendingUp, iconClass: 'text-info' },
    ].map((stat, index) => (
      <Card key={index}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <stat.icon className={`h-5 w-5 ${stat.iconClass}`} />
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xl font-semibold">{isLoading ? <Skeleton height={24} width={40} /> : stat.count}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const DistributorFilters: React.FC<DistributorFiltersProps> = ({ onSearch, onTypeFilter }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search distributors by name..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select onValueChange={onTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={DistributorType.Hospital}>Hospitals</SelectItem>
              <SelectItem value={DistributorType.Pharmacy}>Pharmacies</SelectItem>
              <SelectItem value={DistributorType.Clinic}>Clinics</SelectItem>
              <SelectItem value={DistributorType.Wholesaler}>Wholesalers</SelectItem>
              <SelectItem value={DistributorType.NGO}>NGOs</SelectItem>
              <SelectItem value={DistributorType.Chemist}>Chemists</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DistributorTable: React.FC<DistributorTableProps> = ({ distributors, isLoading, onView, onEdit }) => (
  <Card>
    <CardHeader>
      <CardTitle>Distributors</CardTitle>
      <CardDescription>Manage your distributors and their details</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Purchases</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton height={20} width={150} /></TableCell>
                <TableCell><Skeleton height={20} width={150} /></TableCell>
                <TableCell><Skeleton height={20} width={100} /></TableCell>
                <TableCell><Skeleton height={20} width={120} /></TableCell>
                <TableCell><Skeleton height={20} width={200} /></TableCell>
                <TableCell><Skeleton height={20} width={80} /></TableCell>
                <TableCell><Skeleton height={20} width={100} /></TableCell>
                <TableCell><Skeleton height={20} width={100} /></TableCell>
              </TableRow>
            ))
          ) : distributors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No distributors found</TableCell>
            </TableRow>
          ) : (
            distributors.map((distributor) => (
              <TableRow key={distributor.id}>
                <TableCell>{distributor.code}</TableCell>
                <TableCell>{distributor.name}</TableCell>
                <TableCell>
                  <Badge variant={getTypeBadge(distributor.type)} className={getCustomClasses(distributor.type)}>
                    {distributor.type.charAt(0).toUpperCase() + distributor.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{distributor.phone}</TableCell>
                <TableCell>{distributor.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={distributor.isActive ? 'default' : 'secondary'}>
                    {distributor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>₦{distributor.totalPurchases.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(distributor)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(distributor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
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

const DistributorForm: React.FC<DistributorFormProps> = ({ formData, onChange, onSubmit, onCancel, isLoading, title, submitText }) => (
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="Enter organization name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(type: DistributorType) => onChange({ ...formData, type })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DistributorType.Hospital}>Hospital</SelectItem>
            <SelectItem value={DistributorType.Pharmacy}>Pharmacy</SelectItem>
            <SelectItem value={DistributorType.Clinic}>Clinic</SelectItem>
            <SelectItem value={DistributorType.Wholesaler}>Wholesaler</SelectItem>
            <SelectItem value={DistributorType.NGO}>NGO</SelectItem>
            <SelectItem value={DistributorType.Chemist}>Chemist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange({ ...formData, phone: e.target.value })}
          placeholder="+234-xxx-xxx-xxxx"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="creditLimit">Credit Limit</Label>
        <Input
          id="creditLimit"
          type="number"
          value={formData.creditLimit}
          onChange={(e) => onChange({ ...formData, creditLimit: Number(e.target.value) })}
          placeholder="Enter credit limit"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input
          id="currency"
          value={formData.currency}
          onChange={(e) => onChange({ ...formData, currency: e.target.value })}
          placeholder="Enter currency (e.g., NGN)"
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onChange({ ...formData, address: e.target.value })}
          placeholder="Enter full address"
        />
      </div>
    </div>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={isLoading}>
        {isLoading ? 'Processing...' : submitText}
      </Button>
    </div>
  </DialogContent>
);

const DistributorDetails: React.FC<DistributorDetailsProps> = ({ distributor, getTypeIcon, getTypeBadge, getCustomClasses }) => (
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-3">
        <span className="text-2xl">{getTypeIcon(distributor.type)}</span>
        {distributor.name}
      </DialogTitle>
    </DialogHeader>
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="orders">Order History</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{distributor.phone}</span>
                </div>
                {distributor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{distributor.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Address</h4>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{distributor.address}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Business Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant={getTypeBadge(distributor.type)} className={getCustomClasses(distributor.type)}>
                    {distributor.type.charAt(0).toUpperCase() + distributor.type.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <span>₦{distributor.creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span>{distributor.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={distributor.isActive ? 'default' : 'secondary'}>
                    {distributor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        {distributor.lastOrder && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last order: {new Date(distributor.lastOrder).toLocaleDateString()}</span>
          </div>
        )}
      </TabsContent>
      <TabsContent value="orders">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3>Order History</h3>
          <p className="text-muted-foreground">Order history functionality coming soon</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3>Analytics Dashboard</h3>
          <p className="text-muted-foreground">Analytics and insights coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  </DialogContent>
);

// Main Component
export default function DistributorManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: DistributorType.Pharmacy,
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
    currency: 'NGN',
  });

  const [queryParams, setQueryParams] = useState<DistributorQueryParams>({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
    search: '',
    type: '',
  });

  const { data: distributorsResponse, isLoading, error, refetch } = useDistributors(queryParams);
  const { data: distributorAnalytics, isLoading: isAnalyticsLoading, error: analyticsError } = useDistributorAnalytics();
  const { createDistributor, updateDistributor, isLoading: mutationLoading } = useDistributorManagement();

  const distributors = useMemo(() => distributorsResponse?.data || [], [distributorsResponse?.data]);
  const pagination = useMemo(() => distributorsResponse?.meta || {
    page: 1,
    limit: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  }, [distributorsResponse?.meta]);

  const analytics = useMemo(() => distributorAnalytics || {
    totalDistributors: 0,
    activeDistributors: 0,
    totalSales: 0,
    byType: {},
  }, [distributorAnalytics]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: DistributorType.Pharmacy,
      email: '',
      phone: '',
      address: '',
      creditLimit: 0,
      currency: 'NGN',
    });
  }, []);

  const handleAddDistributor = useCallback(async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createDistributor.mutateAsync({
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        creditLimit: formData.creditLimit,
        currency: formData.currency,
      });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Distributor added successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to add distributor');
    }
  }, [formData, createDistributor, resetForm, refetch]);

  const handleEditDistributor = useCallback(async () => {
    if (!selectedDistributor || !formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateDistributor.mutateAsync({
        distributorId: selectedDistributor.id,
        distributorData: {
          name: formData.name,
          type: formData.type,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          creditLimit: formData.creditLimit,
          currency: formData.currency,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedDistributor(null);
      resetForm();
      toast.success('Distributor updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update distributor');
    }
  }, [formData, selectedDistributor, updateDistributor, resetForm, refetch]);

  const exportDistributors = useCallback(() => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Type,Phone,Email,Address,Credit Limit,Currency,Total Purchases,Status\n"
      + distributors.map(d => 
          `"${d.name}","${d.type}","${d.phone}","${d.email || ''}","${d.address}","${d.creditLimit}","${d.currency}","${d.totalPurchases}","${d.isActive ? 'active' : 'inactive'}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "distributors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [distributors]);

  const handleSearch = useCallback((searchTerm: string) => {
    setQueryParams(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((type: string) => {
    setQueryParams(prev => ({ ...prev, type: type === 'all' ? '' : type, page: 1 }));
  }, []);

  const handlePagination = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setFormData({
      name: distributor.name,
      type: distributor.type,
      email: distributor.email || '',
      phone: distributor.phone,
      address: distributor.address,
      creditLimit: distributor.creditLimit,
      currency: distributor.currency,
    });
    setIsEditDialogOpen(true);
  }, []);

  if (error || analyticsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">
            Error loading data: {error?.message || analyticsError?.message}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="mb-2">Distributor Management</h1>
          <p className="text-muted-foreground">
            Manage your network of hospitals, pharmacies, clinics, wholesalers, and NGOs
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportDistributors} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Add Distributor
              </Button>
            </DialogTrigger>
            <DistributorForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleAddDistributor}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={mutationLoading}
              title="Add New Distributor"
              submitText="Add Distributor"
            />
          </Dialog>
        </div>
      </div>

      <DistributorStats stats={analytics} isLoading={isAnalyticsLoading} />
      <DistributorFilters onSearch={handleSearch} onTypeFilter={handleFilterChange} />
      <DistributorTable
        distributors={distributors}
        isLoading={isLoading}
        onView={setSelectedDistributor}
        onEdit={handleEdit}
      />

      {pagination.pageCount > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.itemCount)} of{' '}
            {pagination.itemCount} distributors
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

      <Dialog open={!!selectedDistributor} onOpenChange={() => setSelectedDistributor(null)}>
        {selectedDistributor && (
          <DistributorDetails
            distributor={selectedDistributor}
            getTypeIcon={getTypeIcon}
            getTypeBadge={getTypeBadge}
            getCustomClasses={getCustomClasses}
          />
        )}
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DistributorForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleEditDistributor}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSelectedDistributor(null);
          }}
          isLoading={mutationLoading}
          title="Edit Distributor"
          submitText="Update Distributor"
        />
      </Dialog>
    </div>
  );
}