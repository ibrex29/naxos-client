/* eslint-disable @typescript-eslint/no-explicit-any */
// app/credit-management/page.tsx  or  components/CreditManagement.tsx
"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Search,
  Phone,
  Calendar,
  Building2,
} from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';
type PaymentHistory = 'excellent' | 'good' | 'fair' | 'poor';
type CustomerType = 'hospital' | 'pharmacy' | 'clinic' | 'ngo' | 'wholesaler';

interface CreditCustomer {
  id: string;
  name: string;
  type: CustomerType;
  creditLimit: number;
  creditUsed: number;
  currentBalance: number;
  overdueAmount: number;
  lastPayment: string;
  paymentHistory: PaymentHistory;
  riskLevel: RiskLevel;
  phone: string;
  contactPerson: string;
}

export default function CreditManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');

  // Mock data
  const creditCustomers: CreditCustomer[] = [
    {
      id: 'CUST-001',
      name: 'Lagos University Teaching Hospital',
      type: 'hospital',
      creditLimit: 10_000_000,
      creditUsed: 3_200_000,
      currentBalance: 2_450_000,
      overdueAmount: 0,
      lastPayment: '2024-09-15',
      paymentHistory: 'excellent',
      riskLevel: 'low',
      phone: '+234-1-234-5678',
      contactPerson: 'Dr. Adebayo Okafor',
    },
    {
      id: 'CUST-002',
      name: 'Medical Aid International',
      type: 'ngo',
      creditLimit: 5_000_000,
      creditUsed: 4_200_000,
      currentBalance: 3_200_000,
      overdueAmount: 800_000,
      lastPayment: '2024-08-20',
      paymentHistory: 'fair',
      riskLevel: 'high',
      phone: '+234-802-345-6789',
      contactPerson: 'Ms. Sarah Johnson',
    },
    {
      id: 'CUST-003',
      name: 'Premier Medical Pharmacy',
      type: 'pharmacy',
      creditLimit: 2_000_000,
      creditUsed: 850_000,
      currentBalance: 850_000,
      overdueAmount: 0,
      lastPayment: '2024-09-01',
      paymentHistory: 'good',
      riskLevel: 'medium',
      phone: '+234-803-456-7890',
      contactPerson: 'Mr. Emeka Okafor',
    },
    {
      id: 'CUST-004',
      name: 'Rural Health Centers',
      type: 'clinic',
      creditLimit: 3_000_000,
      creditUsed: 2_100_000,
      currentBalance: 1_150_000,
      overdueAmount: 950_000,
      lastPayment: '2024-07-15',
      paymentHistory: 'poor',
      riskLevel: 'high',
      phone: '+234-804-567-8901',
      contactPerson: 'Dr. Fatima Abdullahi',
    },
    {
      id: 'CUST-005',
      name: 'Abuja Clinic Network',
      type: 'clinic',
      creditLimit: 1_500_000,
      creditUsed: 450_000,
      currentBalance: 0,
      overdueAmount: 0,
      lastPayment: '2024-09-18',
      paymentHistory: 'excellent',
      riskLevel: 'low',
      phone: '+234-805-678-9012',
      contactPerson: 'Dr. Amina Hassan',
    },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);

  const getCreditUtilization = (used: number, limit: number) =>
    (used / limit) * 100;

  const getRiskBadge = (level: RiskLevel) => {
    const variants = {
      low: 'bg-success/10 text-success border-success/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={variants[level]}>High Risk</Badge>;
  };

  const getPaymentHistoryBadge = (history: PaymentHistory) => {
    const variants = {
      excellent: 'bg-success/10 text-success border-success/20',
      good: 'bg-info/10 text-info border-info/20',
      fair: 'bg-warning/10 text-warning border-warning/20',
      poor: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={variants[history]}>{history.charAt(0).toUpperCase() + history.slice(1)}</Badge>;
  };

  const getCustomerTypeBadge = (type: CustomerType) => {
    const styles = {
      hospital: 'bg-primary/10 text-primary border-primary/20',
      pharmacy: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      clinic: 'bg-blue-100 text-blue-700 border-blue-300',
      ngo: 'bg-purple-100 text-purple-700 border-purple-300',
      wholesaler: 'bg-orange-100 text-orange-700 border-orange-300',
    };

    return (
      <Badge variant="outline" className={styles[type] || 'bg-muted'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  // Filtering logic
  const filteredCustomers = creditCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || customer.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Aggregated stats
  const totalCreditLimit = creditCustomers.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalCreditUsed = creditCustomers.reduce((sum, c) => sum + c.creditUsed, 0);
  const totalOverdue = creditCustomers.reduce((sum, c) => sum + c.overdueAmount, 0);
  const highRiskCount = creditCustomers.filter((c) => c.riskLevel === 'high').length;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
          <p className="text-muted-foreground">
            Monitor credit limits, utilization, and payment risks
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credit Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCreditLimit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Utilized</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCreditUsed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Overdue</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk Customers</p>
                <p className="text-2xl font-bold text-destructive">{highRiskCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, contact, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const utilization = getCreditUtilization(customer.creditUsed, customer.creditLimit);

          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">{customer.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      {getCustomerTypeBadge(customer.type)}
                      {getRiskBadge(customer.riskLevel)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {customer.id}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Credit Utilization */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Credit Utilization</span>
                    <span className="font-medium">{utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={utilization} className={`h-3 ${getUtilizationColor(utilization)}`} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatCurrency(customer.creditUsed)}</span>
                    <span>of {formatCurrency(customer.creditLimit)}</span>
                  </div>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="font-semibold text-lg">{formatCurrency(customer.currentBalance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overdue</p>
                    <p className={`font-semibold text-lg ${customer.overdueAmount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatCurrency(customer.overdueAmount)}
                    </p>
                  </div>
                </div>

                {/* Payment & Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment History</span>
                    {getPaymentHistoryBadge(customer.paymentHistory)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Payment:</span>
                    <span className="font-medium">
                      {new Date(customer.lastPayment).toLocaleDateString('en-NG')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{customer.contactPerson}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No customers found matching your criteria.</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}