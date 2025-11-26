/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/accounts-overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  icon: React.ComponentType<any>;
}

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentType: 'cash' | 'credit';
  date: string;
}

interface OverdueAccount {
  customer: string;
  amount: number;
  daysOverdue: number;
  lastContact: string;
}

  const financialKPIs: KPI[] = [
    {
      title: 'Total Revenue (This Month)',
      value: '₦45,750,000',
      change: '+12.5%',
      trend: { value: 12.5, direction: 'up' },
      icon: DollarSign
    },
    {
      title: 'Outstanding Credits',
      value: '₦8,250,000',
      change: '-5.2%',
      trend: { value: 5.2, direction: 'down' },
      icon: CreditCard
    },
    {
      title: 'Completed Orders',
      value: '1,247',
      change: '+8.1%',
      trend: { value: 8.1, direction: 'up' },
      icon: Receipt
    },
    {
      title: 'Collection Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: { value: 2.1, direction: 'up' },
      icon: TrendingUp
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: 'ORD-2024-1245',
      customer: 'Lagos University Teaching Hospital',
      amount: 2450000,
      currency: 'NGN',
      status: 'paid',
      paymentType: 'credit',
      date: '2024-09-20'
    },
    {
      id: 'ORD-2024-1244',
      customer: 'Premier Medical Pharmacy',
      amount: 850000,
      currency: 'NGN',
      status: 'pending',
      paymentType: 'credit',
      date: '2024-09-19'
    },
    {
      id: 'ORD-2024-1243',
      customer: 'City General Hospital',
      amount: 1750000,
      currency: 'NGN',
      status: 'paid',
      paymentType: 'cash',
      date: '2024-09-19'
    },
    {
      id: 'ORD-2024-1242',
      customer: 'Medical Aid International',
      amount: 3200000,
      currency: 'NGN',
      status: 'overdue',
      paymentType: 'credit',
      date: '2024-09-15'
    },
    {
      id: 'ORD-2024-1241',
      customer: 'Abuja Clinic Network',
      amount: 920000,
      currency: 'NGN',
      status: 'paid',
      paymentType: 'cash',
      date: '2024-09-18'
    }
  ];

  const overdueAccounts: OverdueAccount[] = [
    {
      customer: 'Medical Aid International',
      amount: 3200000,
      daysOverdue: 6,
      lastContact: '2024-09-18'
    },
    {
      customer: 'Rural Health Centers',
      amount: 1150000,
      daysOverdue: 12,
      lastContact: '2024-09-10'
    },
    {
      customer: 'Kano State Hospital',
      amount: 875000,
      daysOverdue: 3,
      lastContact: '2024-09-17'
    }
  ];

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 1600);
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: 'cash' | 'credit') => (
    <Badge variant="outline" className="text-xs">
      {type === 'cash' ? 'Cash' : 'Credit'}
    </Badge>
  );

const AccountOverviewPage = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts Overview</h1>
          <p className="text-muted-foreground">
            Financial tracking and credit management dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Last updated: {new Date().toLocaleDateString('en-NG')}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialKPIs.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Recent Transactions & Overdue Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{transaction.customer}</p>
                        {getPaymentTypeBadge(transaction.paymentType)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.id}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('en-NG')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Accounts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Overdue Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="p-4 border border-destructive/20 rounded-lg bg-destructive/5"
                  >
                    <p className="font-medium text-sm">{account.customer}</p>
                    <p className="text-destructive font-semibold text-lg">
                      {formatCurrency(account.amount)}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between text-xs text-muted-foreground mt-2 gap-2">
                      <span>{account.daysOverdue} days overdue</span>
                      <span>Last: {new Date(account.lastContact).toLocaleDateString('en-NG')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewPage;