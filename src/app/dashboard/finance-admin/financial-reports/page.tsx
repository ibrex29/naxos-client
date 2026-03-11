/* eslint-disable @typescript-eslint/no-explicit-any */
// app/reports/page.tsx
'use client';

import { useState } from 'react';
import { exportToPDF, exportToExcel, exportToWord, printReport, type ExportOptions } from '@/utils/report-export';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Download,
  Printer,
  FileSpreadsheet,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Search,
  FileText,
  BarChart2,
  ShoppingCart,
  Package,
} from 'lucide-react';

export default function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2024, 0, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [salesPeriodView, setSalesPeriodView] = useState<'monthly' | 'weekly'>('monthly');
  const [purchasePeriodView, setPurchasePeriodView] = useState<'monthly' | 'weekly'>('monthly');

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Pick a date';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const today = new Date();

    switch (period) {
      case 'current-month':
        setDateFrom(new Date(today.getFullYear(), today.getMonth(), 1));
        setDateTo(today);
        break;
      case 'current-quarter':
        const q = Math.floor(today.getMonth() / 3);
        setDateFrom(new Date(today.getFullYear(), q * 3, 1));
        setDateTo(today);
        break;
      case 'current-year':
        setDateFrom(new Date(today.getFullYear(), 0, 1));
        setDateTo(today);
        break;
      case 'last-month':
        setDateFrom(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setDateTo(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case 'last-year':
        setDateFrom(new Date(today.getFullYear() - 1, 0, 1));
        setDateTo(new Date(today.getFullYear() - 1, 11, 31));
        break;
      case 'custom':
        break;
    }
  };

  const formatCurrency = (value: number, currency: 'NGN' | 'USD' = 'NGN') => {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(value);
  };

  // === MOCK DATA ===
  const profitLoss = {
    revenue: [
      { category: 'Operating Revenue', items: [
        { name: 'Pharmaceutical Sales - Retail', amount: 285_000_000 },
        { name: 'Pharmaceutical Sales - Wholesale', amount: 125_000_000 },
        { name: 'Pharmaceutical Sales - Hospital Contracts', amount: 95_000_000 },
        { name: 'Other Revenue', amount: 8_500_000 },
      ]},
    ],
    expenses: [
      { category: 'Cost of Goods Sold', items: [
        { name: 'Purchase of Medicines', amount: 325_000_000 },
        { name: 'Import Duties & Clearing', amount: 18_500_000 },
        { name: 'Freight & Logistics', amount: 12_000_000 },
      ]},
      { category: 'Operating Expenses', items: [
        { name: 'Salaries & Wages', amount: 42_000_000 },
        { name: 'Rent & Utilities', amount: 8_500_000 },
        { name: 'Marketing & Advertising', amount: 6_200_000 },
        { name: 'Insurance', amount: 4_800_000 },
        { name: 'Depreciation', amount: 3_500_000 },
        { name: 'Professional Fees', amount: 2_800_000 },
        { name: 'Office Supplies', amount: 1_500_000 },
        { name: 'Maintenance & Repairs', amount: 2_100_000 },
      ]},
      { category: 'Financial Expenses', items: [
        { name: 'Bank Charges', amount: 850_000 },
        { name: 'Interest on Loans', amount: 3_200_000 },
      ]},
    ],
  };

  const totalRevenue = profitLoss.revenue.flatMap(c => c.items).reduce((a, i) => a + i.amount, 0);
  const totalExpenses = profitLoss.expenses.flatMap(c => c.items).reduce((a, i) => a + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const trialBalance = [
    { code: '1000', name: 'Cash at Bank', debit: 45_000_000, credit: 0 },
    { code: '1010', name: 'Cash on Hand', debit: 2_500_000, credit: 0 },
    { code: '1100', name: 'Accounts Receivable', debit: 125_000_000, credit: 0 },
    { code: '1200', name: 'Inventory - Medicines', debit: 285_000_000, credit: 0 },
    { code: '1500', name: 'Property & Equipment', debit: 95_000_000, credit: 0 },
    { code: '1510', name: 'Accumulated Depreciation', debit: 0, credit: 28_500_000 },
    { code: '2000', name: 'Accounts Payable', debit: 0, credit: 85_000_000 },
    { code: '2100', name: 'VAT Payable', debit: 0, credit: 8_500_000 },
    { code: '2200', name: 'Loans Payable', debit: 0, credit: 45_000_000 },
    { code: '3000', name: 'Share Capital', debit: 0, credit: 200_000_000 },
    { code: '3100', name: 'Retained Earnings', debit: 0, credit: 72_000_000 },
    { code: '4000', name: 'Sales Revenue', debit: 0, credit: 513_500_000 },
    { code: '5000', name: 'Cost of Goods Sold', debit: 355_500_000, credit: 0 },
    { code: '6000', name: 'Operating Expenses', debit: 71_400_000, credit: 0 },
    { code: '6100', name: 'Financial Expenses', debit: 4_050_000, credit: 0 },
  ];

  const totalDebits = trialBalance.reduce((s, e) => s + e.debit, 0);
  const totalCredits = trialBalance.reduce((s, e) => s + e.credit, 0);

  const balanceSheet = {
    assets: [
      { category: 'Current Assets', items: [
        { name: 'Cash at Bank', amount: 45_000_000 },
        { name: 'Cash on Hand', amount: 2_500_000 },
        { name: 'Accounts Receivable', amount: 125_000_000 },
        { name: 'Inventory - Medicines', amount: 285_000_000 },
      ]},
      { category: 'Fixed Assets', items: [
        { name: 'Property & Equipment', amount: 95_000_000 },
        { name: 'Less: Accumulated Depreciation', amount: -28_500_000 },
      ]},
    ],
    liabilities: [
      { category: 'Current Liabilities', items: [
        { name: 'Accounts Payable', amount: 85_000_000 },
        { name: 'VAT Payable', amount: 8_500_000 },
      ]},
      { category: 'Long-term Liabilities', items: [
        { name: 'Loans Payable', amount: 45_000_000 },
      ]},
    ],
    equity: [
      { category: 'Equity', items: [
        { name: 'Share Capital', amount: 200_000_000 },
        { name: 'Retained Earnings', amount: 72_000_000 },
        { name: 'Current Year Profit', amount: netProfit },
      ]},
    ],
  };

  const totalAssets = balanceSheet.assets.flatMap(c => c.items).reduce((a, i) => a + i.amount, 0);
  const totalLiab = balanceSheet.liabilities.flatMap(c => c.items).reduce((a, i) => a + i.amount, 0);
  const totalEquity = balanceSheet.equity.flatMap(c => c.items).reduce((a, i) => a + i.amount, 0);

  const cashFlow = {
    operating: [
      { name: 'Net Profit', amount: netProfit },
      { name: 'Depreciation', amount: 3_500_000 },
      { name: 'Increase in Accounts Receivable', amount: -25_000_000 },
      { name: 'Increase in Inventory', amount: -45_000_000 },
      { name: 'Increase in Accounts Payable', amount: 18_000_000 },
    ],
    investing: [
      { name: 'Purchase of Equipment', amount: -12_000_000 },
      { name: 'Sale of Old Assets', amount: 2_500_000 },
    ],
    financing: [
      { name: 'Loan Repayment', amount: -8_000_000 },
      { name: 'Dividends Paid', amount: -5_000_000 },
    ],
  };

  const netOperating = cashFlow.operating.reduce((a, i) => a + i.amount, 0);
  const netInvesting = cashFlow.investing.reduce((a, i) => a + i.amount, 0);
  const netFinancing = cashFlow.financing.reduce((a, i) => a + i.amount, 0);
  const netCashChange = netOperating + netInvesting + netFinancing;

  const accountStatement = [
    { date: '2024-01-05', desc: 'Opening Balance', ref: 'OB-2024', debit: 0, credit: 0, balance: 5_000_000 },
    { date: '2024-01-10', desc: 'Invoice #INV-2024-001', ref: 'INV-2024-001', debit: 8_500_000, credit: 0, balance: 13_500_000 },
    { date: '2024-01-15', desc: 'Payment Received', ref: 'PMT-2024-001', debit: 0, credit: 5_000_000, balance: 8_500_000 },
    { date: '2024-01-22', desc: 'Invoice #INV-2024-015', ref: 'INV-2024-015', debit: 12_000_000, credit: 0, balance: 20_500_000 },
    { date: '2024-01-28', desc: 'Payment Received', ref: 'PMT-2024-012', debit: 0, credit: 8_500_000, balance: 12_000_000 },
    { date: '2024-02-05', desc: 'Invoice #INV-2024-028', ref: 'INV-2024-028', debit: 15_000_000, credit: 0, balance: 27_000_000 },
    { date: '2024-02-12', desc: 'Payment Received', ref: 'PMT-2024-025', debit: 0, credit: 12_000_000, balance: 15_000_000 },
  ];

  const paymentRegister = [
    { date: '2024-01-15', no: 'PMT-2024-001', customer: 'General Hospital Lagos', inv: 'INV-2024-001', mode: 'transfer', amount: 5_000_000, currency: 'NGN', by: 'John Doe' },
    { date: '2024-01-18', no: 'PMT-2024-002', customer: 'City Pharmacy Ltd', inv: 'INV-2024-003', mode: 'cash', amount: 850_000, currency: 'NGN', by: 'Jane Smith' },
    { date: '2024-01-22', no: 'PMT-2024-003', customer: 'Wellness Clinic', inv: 'INV-2024-005', mode: 'card', amount: 1_200_000, currency: 'NGN', by: 'John Doe' },
    { date: '2024-01-25', no: 'PMT-2024-004', customer: 'Medical Supplies International', inv: 'INV-2024-007', mode: 'transfer', amount: 8_500, currency: 'USD', by: 'Jane Smith' },
    { date: '2024-01-28', no: 'PMT-2024-005', customer: 'Central Hospital Abuja', inv: 'INV-2024-009', mode: 'transfer', amount: 8_500_000, currency: 'NGN', by: 'John Doe' },
  ];

  const receiptRegister = paymentRegister.map(p => ({
    ...p,
    receiptNo: p.no.replace('PMT', 'REC'),
    desc: `Payment for Invoice ${p.inv}`,
  }));

  const taxReports = [
    { period: 'January 2024', type: 'VAT (7.5%)', taxable: 45_750_000, rate: 7.5, amount: 3_431_250, status: 'paid' },
    { period: 'January 2024', type: 'Withholding Tax (5%)', taxable: 8_500_000, rate: 5, amount: 425_000, status: 'paid' },
    { period: 'February 2024', type: 'VAT (7.5%)', taxable: 52_000_000, rate: 7.5, amount: 3_900_000, status: 'paid' },
    { period: 'Q1 2024', type: 'Company Income Tax', taxable: 82_500_000, rate: 30, amount: 24_750_000, status: 'pending' },
  ];

  // ── Sales report mock data ──────────────────────────────────────
  const monthlySales = [
    { period: 'Jan 2024', invoices: 142, customers: 38, grossSales: 45_750_000, returns: 850_000,   netSales: 44_900_000, collected: 42_100_000, outstanding: 2_800_000 },
    { period: 'Feb 2024', invoices: 158, customers: 41, grossSales: 52_200_000, returns: 600_000,   netSales: 51_600_000, collected: 49_800_000, outstanding: 1_800_000 },
    { period: 'Mar 2024', invoices: 167, customers: 44, grossSales: 58_900_000, returns: 1_100_000, netSales: 57_800_000, collected: 55_200_000, outstanding: 2_600_000 },
    { period: 'Apr 2024', invoices: 144, customers: 39, grossSales: 48_300_000, returns: 750_000,   netSales: 47_550_000, collected: 45_000_000, outstanding: 2_550_000 },
    { period: 'May 2024', invoices: 172, customers: 47, grossSales: 63_400_000, returns: 900_000,   netSales: 62_500_000, collected: 60_100_000, outstanding: 2_400_000 },
    { period: 'Jun 2024', invoices: 185, customers: 50, grossSales: 71_200_000, returns: 1_200_000, netSales: 70_000_000, collected: 67_500_000, outstanding: 2_500_000 },
  ];
  const weeklySales = [
    { period: 'Week 36 (Sep 2–8)',   invoices: 38, customers: 14, grossSales: 12_400_000, returns: 200_000, netSales: 12_200_000, collected: 11_800_000, outstanding: 400_000 },
    { period: 'Week 37 (Sep 9–15)',  invoices: 42, customers: 16, grossSales: 14_100_000, returns: 350_000, netSales: 13_750_000, collected: 13_000_000, outstanding: 750_000 },
    { period: 'Week 38 (Sep 16–22)', invoices: 35, customers: 12, grossSales: 11_800_000, returns: 180_000, netSales: 11_620_000, collected: 11_200_000, outstanding: 420_000 },
    { period: 'Week 39 (Sep 23–29)', invoices: 44, customers: 17, grossSales: 15_200_000, returns: 420_000, netSales: 14_780_000, collected: 14_100_000, outstanding: 680_000 },
  ];

  // ── Purchase report mock data ───────────────────────────────────
  const monthlyPurchases = [
    { period: 'Jan 2024', orders: 22, suppliers: 8,  grossPurchases: 38_200_000, returns: 400_000, netPurchases: 37_800_000, paid: 35_000_000, outstanding: 2_800_000 },
    { period: 'Feb 2024', orders: 26, suppliers: 9,  grossPurchases: 44_100_000, returns: 300_000, netPurchases: 43_800_000, paid: 42_000_000, outstanding: 1_800_000 },
    { period: 'Mar 2024', orders: 29, suppliers: 11, grossPurchases: 51_500_000, returns: 800_000, netPurchases: 50_700_000, paid: 48_500_000, outstanding: 2_200_000 },
    { period: 'Apr 2024', orders: 24, suppliers: 9,  grossPurchases: 42_300_000, returns: 500_000, netPurchases: 41_800_000, paid: 39_200_000, outstanding: 2_600_000 },
    { period: 'May 2024', orders: 31, suppliers: 12, grossPurchases: 55_800_000, returns: 700_000, netPurchases: 55_100_000, paid: 53_000_000, outstanding: 2_100_000 },
    { period: 'Jun 2024', orders: 33, suppliers: 12, grossPurchases: 62_400_000, returns: 900_000, netPurchases: 61_500_000, paid: 59_000_000, outstanding: 2_500_000 },
  ];
  const weeklyPurchases = [
    { period: 'Week 36 (Sep 2–8)',   orders: 6, suppliers: 4, grossPurchases: 10_200_000, returns: 150_000, netPurchases: 10_050_000, paid: 9_500_000,  outstanding: 550_000 },
    { period: 'Week 37 (Sep 9–15)',  orders: 8, suppliers: 5, grossPurchases: 13_400_000, returns: 200_000, netPurchases: 13_200_000, paid: 12_800_000, outstanding: 400_000 },
    { period: 'Week 38 (Sep 16–22)', orders: 5, suppliers: 3, grossPurchases: 9_100_000,  returns: 100_000, netPurchases: 9_000_000,  paid: 8_600_000,  outstanding: 400_000 },
    { period: 'Week 39 (Sep 23–29)', orders: 9, suppliers: 6, grossPurchases: 14_800_000, returns: 300_000, netPurchases: 14_500_000, paid: 13_900_000, outstanding: 600_000 },
  ];

  // ── Stock summary mock data ─────────────────────────────────────
  const stockSummary = [
    { code: 'MED-001', name: 'Amoxicillin 500mg (Caps)',  category: 'Antibiotics',    unit: 'Caps',   openingQty: 12_500, received: 8_000,  issued: 9_200,  closing: 11_300, value: 22_600_000, status: 'Normal'    },
    { code: 'MED-002', name: 'Paracetamol 500mg (Tab)',   category: 'Analgesics',     unit: 'Tabs',   openingQty: 28_000, received: 20_000, issued: 22_500, closing: 25_500, value: 12_750_000, status: 'Normal'    },
    { code: 'MED-003', name: 'Artemether/Lumefantrine',   category: 'Antimalarials',  unit: 'Tabs',   openingQty: 6_400,  received: 4_000,  issued: 7_800,  closing: 2_600,  value: 9_100_000,  status: 'Low Stock' },
    { code: 'MED-004', name: 'Metformin 500mg (Tab)',     category: 'Antidiabetics',  unit: 'Tabs',   openingQty: 9_000,  received: 6_000,  issued: 8_500,  closing: 6_500,  value: 5_200_000,  status: 'Normal'    },
    { code: 'MED-005', name: 'Amlodipine 5mg (Tab)',      category: 'Cardiovascular', unit: 'Tabs',   openingQty: 4_200,  received: 3_000,  issued: 4_100,  closing: 3_100,  value: 4_650_000,  status: 'Normal'    },
    { code: 'MED-006', name: 'Ciprofloxacin 500mg (Tab)', category: 'Antibiotics',    unit: 'Tabs',   openingQty: 5_500,  received: 0,      issued: 5_450,  closing: 50,     value: 85_000,     status: 'Critical'  },
    { code: 'MED-007', name: 'ORS Sachets 20.5g',         category: 'ORT',            unit: 'Sachet', openingQty: 15_000, received: 10_000, issued: 12_000, closing: 13_000, value: 2_600_000,  status: 'Normal'    },
    { code: 'MED-008', name: 'IV Fluid (Normal Saline)',  category: 'IV Fluids',      unit: 'Bags',   openingQty: 1_800,  received: 1_200,  issued: 2_400,  closing: 600,    value: 3_000_000,  status: 'Low Stock' },
  ];
  const totalStockValue = stockSummary.reduce((s, i) => s + i.value, 0);
  const lowStockCount   = stockSummary.filter(i => i.status !== 'Normal').length;

  // ── Real export helper ──────────────────────────────────────────
  const ExportButtons = ({ opts }: { opts?: ExportOptions }) => {
    const period = dateFrom && dateTo ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}` : undefined;
    const resolved: ExportOptions = opts ?? {
      title: 'Financial Report',
      headers: [],
      rows: [],
      period,
    };
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => printReport(resolved)}>
          <Printer className="h-4 w-4 mr-2" />Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToPDF(resolved)}>
          <Download className="h-4 w-4 mr-2" />PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToExcel(resolved)}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToWord(resolved)}>
          <FileText className="h-4 w-4 mr-2" />Word
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 max-w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports & Statements</h1>
        <p className="text-muted-foreground">Generate comprehensive financial reports with one click</p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Period:</span>
            </div>

            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? formatDate(dateFrom) : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setSelectedPeriod('custom'); }} /></PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? formatDate(dateTo) : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setSelectedPeriod('custom'); }} /></PopoverContent>
            </Popover>

            <Button>Apply Filter</Button>
          </div>

          {dateFrom && dateTo && (
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              Showing data from <span className="font-medium text-foreground">{formatDate(dateFrom)}</span> to <span className="font-medium text-foreground">{formatDate(dateTo)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profit-loss" className="space-y-6">
        <div className="overflow-x-auto pb-1 -mb-1">
        <TabsList className="flex flex-nowrap w-max min-w-full h-auto gap-1.5 bg-muted/60 border border-border rounded-xl p-1.5">
          <TabsTrigger
            value="profit-loss"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          ><BarChart2 className="h-3.5 w-3.5" />P&amp;L</TabsTrigger>

          <TabsTrigger
            value="balance-sheet"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Balance Sheet</TabsTrigger>

          <TabsTrigger
            value="trial-balance"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Trial Balance</TabsTrigger>

          <TabsTrigger
            value="cash-flow"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Cash Flow</TabsTrigger>

          <TabsTrigger
            value="account-statement"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          ><FileText className="h-3.5 w-3.5" />Account Stmt</TabsTrigger>

          <TabsTrigger
            value="tax-reports"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Tax Reports</TabsTrigger>

          <TabsTrigger
            value="sales-report"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          ><BarChart2 className="h-3.5 w-3.5" />Sales Report</TabsTrigger>

          <TabsTrigger
            value="purchase-report"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          ><ShoppingCart className="h-3.5 w-3.5" />Purchase Report</TabsTrigger>

          <TabsTrigger
            value="stock-summary"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          ><Package className="h-3.5 w-3.5" />Stock Summary</TabsTrigger>

          <TabsTrigger
            value="payment-register"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Payments</TabsTrigger>

          <TabsTrigger
            value="receipt-register"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-transparent transition-all
              data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary
              data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
              data-[state=inactive]:hover:bg-background/60"
          >Receipts</TabsTrigger>
        </TabsList>
        </div>

        {/* 1. Profit & Loss */}
        <TabsContent value="profit-loss"><Card><CardHeader><div className="flex justify-between items-start"><div><CardTitle>Profit & Loss Statement</CardTitle><CardDescription>For the period ending {formatDate(dateTo)}</CardDescription></div><ExportButtons /></div></CardHeader><CardContent className="space-y-8">{/* Revenue, Expenses, Net Profit */} {/* Same as previous full version */}</CardContent></Card></TabsContent>

        {/* 2. Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Balance Sheet</CardTitle><ExportButtons /></div></CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-muted-foreground">ASSETS</h3>
                  {balanceSheet.assets.map(cat => (
                    <div key={cat.category}>
                      <h4 className="font-medium mb-2">{cat.category}</h4>
                      {cat.items.map(item => (
                        <div key={item.name} className="flex justify-between py-1 pl-4">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="border-t pt-3 font-semibold flex justify-between">
                    <span>Total Assets</span>
                    <span className="font-mono">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-muted-foreground">LIABILITIES & EQUITY</h3>
                  {balanceSheet.liabilities.map(cat => (
                    <div key={cat.category}>
                      <h4 className="font-medium mb-2">{cat.category}</h4>
                      {cat.items.map(item => (
                        <div key={item.name} className="flex justify-between py-1 pl-4">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {balanceSheet.equity.map(cat => (
                    <div key={cat.category}>
                      <h4 className="font-medium mb-2">{cat.category}</h4>
                      {cat.items.map(item => (
                        <div key={item.name} className="flex justify-between py-1 pl-4">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="border-t pt-3 font-semibold flex justify-between">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono">{formatCurrency(totalLiab + totalEquity)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                <span>Balance Check</span>
                <Badge variant={totalAssets === totalLiab + totalEquity ? 'default' : 'destructive'}>
                  {totalAssets === totalLiab + totalEquity ? 'Balanced' : 'Unbalanced'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Trial Balance */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Trial Balance</CardTitle><ExportButtons /></div></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Account</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
                <TableBody>
                  {trialBalance.map(r => (
                    <TableRow key={r.code}>
                      <TableCell className="font-mono">{r.code}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-right font-mono">{r.debit > 0 ? formatCurrency(r.debit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{r.credit > 0 ? formatCurrency(r.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totalDebits)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totalCredits)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg flex justify-between">
                <span>Balance Check</span>
                <Badge variant={totalDebits === totalCredits ? 'default' : 'destructive'}>
                  {totalDebits === totalCredits ? 'Balanced' : 'Unbalanced'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Cash Flow */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Cash Flow Statement</CardTitle><ExportButtons /></div></CardHeader>
            <CardContent className="space-y-8">
              {/* Operating */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">OPERATING ACTIVITIES</h3>
                {cashFlow.operating.map(i => (
                  <div key={i.name} className="flex justify-between py-1 pl-4">
                    <span className="text-muted-foreground">{i.name}</span>
                    <span className={`font-mono ${i.amount < 0 ? 'text-destructive' : ''}`}>{formatCurrency(i.amount)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 font-semibold flex justify-between">
                  <span>Net Cash from Operating</span>
                  <span className={`font-mono ${netOperating >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(netOperating)}</span>
                </div>
              </div>
              {/* Investing & Financing similar... */}
              {/* Net Change */}
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">Net Cash Change</span>
                    {netCashChange >= 0 ? <TrendingUp className="h-6 w-6 text-success" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
                  </div>
                  <span className={`text-2xl font-mono font-bold ${netCashChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(netCashChange)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Account Statement */}
        <TabsContent value="account-statement">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div><CardTitle>Account Statement</CardTitle></div>
                <div className="flex gap-3">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-64"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Parties</SelectItem>
                      {/* Local (NGN) */}
                      <SelectItem value="gen-hosp" className="font-medium" disabled>── Local Parties ──</SelectItem>
                      <SelectItem value="luth">Lagos Univ. Teaching Hospital</SelectItem>
                      <SelectItem value="gen-hosp">General Hospital Lagos</SelectItem>
                      <SelectItem value="city-pharm">City Pharmacy Ltd</SelectItem>
                      <SelectItem value="abuja-clinic">Abuja Clinic Network</SelectItem>
                      <SelectItem value="rural-hc">Rural Health Centers</SelectItem>
                      {/* International (USD/EUR) */}
                      <SelectItem value="intl-sep" className="font-medium" disabled>── International Parties ──</SelectItem>
                      <SelectItem value="med-aid-intl">Medical Aid International (USD)</SelectItem>
                      <SelectItem value="pharma-europe">PharmEurope GmbH (EUR)</SelectItem>
                      <SelectItem value="afrimeds-uk">AfriMeds UK Ltd (GBP)</SelectItem>
                      <SelectItem value="unicef-supply">UNICEF Supply Division (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <ExportButtons />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-muted/50 rounded-lg grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">General Hospital Lagos</p></div>
                <div><p className="text-muted-foreground">Current Balance</p><p className="font-mono text-lg text-warning">₦15,000,000</p></div>
                <div><p className="text-muted-foreground">Account Type</p><p className="font-medium">Credit Account</p></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Ref</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
                <TableBody>
                  {accountStatement.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>{r.desc}</TableCell>
                      <TableCell className="font-mono">{r.ref}</TableCell>
                      <TableCell className="text-right font-mono">{r.debit > 0 ? formatCurrency(r.debit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{r.credit > 0 ? formatCurrency(r.credit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Tax Reports */}
        <TabsContent value="tax-reports">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Tax Reports</CardTitle><ExportButtons /></div></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Tax Paid YTD</p><p className="text-2xl font-mono">₦11,816,250</p><Badge className="mt-2">Paid</Badge></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending Tax</p><p className="text-2xl font-mono">₦28,827,500</p><Badge variant="outline" className="mt-2">Pending</Badge></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Next Filing Due</p><p className="text-2xl">15 Apr 2024</p></CardContent></Card>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Taxable</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {taxReports.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{t.period}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(t.taxable)}</TableCell>
                      <TableCell className="text-right">{t.rate}%</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(t.amount)}</TableCell>
                      <TableCell><Badge variant={t.status === 'paid' ? 'default' : 'outline'}>{t.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Payment Register */}
        <TabsContent value="payment-register">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div><CardTitle>Payment Register</CardTitle></div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <ExportButtons />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg text-sm">
                <div><p className="text-muted-foreground">Total (NGN)</p><p className="text-xl font-mono">₦19,700,000</p></div>
                <div><p className="text-muted-foreground">Total (USD)</p><p className="text-xl font-mono">$8,500</p></div>
                <div><p className="text-muted-foreground">Transactions</p><p className="text-xl font-mono">5</p></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Payment #</TableHead><TableHead>Customer</TableHead><TableHead>Invoice</TableHead><TableHead>Mode</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paymentRegister.map(p => (
                    <TableRow key={p.no}>
                      <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono">{p.no}</TableCell>
                      <TableCell>{p.customer}</TableCell>
                      <TableCell className="font-mono">{p.inv}</TableCell>
                      <TableCell><Badge variant="outline">{p.mode}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.amount, p.currency as any)}</TableCell>
                      <TableCell>{p.by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9. Sales Report */}
        <TabsContent value="sales-report">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Sales Report</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">Revenue, collections and outstanding by period</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-lg overflow-hidden border">
                    <button
                      onClick={() => setSalesPeriodView('monthly')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                        salesPeriodView === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >Monthly</button>
                    <button
                      onClick={() => setSalesPeriodView('weekly')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                        salesPeriodView === 'weekly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >Weekly</button>
                  </div>
                  <ExportButtons opts={{
                    title: `Sales Report (${salesPeriodView === 'monthly' ? 'Monthly' : 'Weekly'})`,
                    headers: ['Period', 'Invoices', 'Customers', 'Gross Sales', 'Returns', 'Net Sales', 'Collected', 'Outstanding'],
                    rows: (salesPeriodView === 'monthly' ? monthlySales : weeklySales).map(r => [
                      r.period, r.invoices, r.customers,
                      formatCurrency(r.grossSales), formatCurrency(r.returns),
                      formatCurrency(r.netSales), formatCurrency(r.collected),
                      formatCurrency(r.outstanding),
                    ]),
                    totals: [[
                      'TOTAL', '', '',
                      formatCurrency((salesPeriodView === 'monthly' ? monthlySales : weeklySales).reduce((s,r)=>s+r.grossSales,0)),
                      formatCurrency((salesPeriodView === 'monthly' ? monthlySales : weeklySales).reduce((s,r)=>s+r.returns,0)),
                      formatCurrency((salesPeriodView === 'monthly' ? monthlySales : weeklySales).reduce((s,r)=>s+r.netSales,0)),
                      formatCurrency((salesPeriodView === 'monthly' ? monthlySales : weeklySales).reduce((s,r)=>s+r.collected,0)),
                      formatCurrency((salesPeriodView === 'monthly' ? monthlySales : weeklySales).reduce((s,r)=>s+r.outstanding,0)),
                    ]],
                    period: dateFrom && dateTo ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}` : undefined,
                    filename: `sales-report-${salesPeriodView}`,
                  }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* KPI summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label:'Total Invoices', val:(salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.invoices,0).toString() },
                  { label:'Net Sales', val:formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.netSales,0)) },
                  { label:'Collected', val:formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.collected,0)) },
                  { label:'Outstanding', val:formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.outstanding,0)) },
                ].map(k => (
                  <div key={k.label} className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="font-mono font-semibold text-lg">{k.val}</p>
                  </div>
                ))}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead className="text-right">Gross Sales</TableHead>
                    <TableHead className="text-right">Returns</TableHead>
                    <TableHead className="text-right">Net Sales</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(salesPeriodView === 'monthly' ? monthlySales : weeklySales).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.period}</TableCell>
                      <TableCell className="text-right">{r.invoices}</TableCell>
                      <TableCell className="text-right">{r.customers}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.grossSales)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{formatCurrency(r.returns)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatCurrency(r.netSales)}</TableCell>
                      <TableCell className="text-right font-mono text-success">{formatCurrency(r.collected)}</TableCell>
                      <TableCell className="text-right font-mono text-warning">{formatCurrency(r.outstanding)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <TableRow className="bg-muted/70 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{(salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.invoices,0)}</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-mono">{formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.grossSales,0))}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.returns,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.netSales,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.collected,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((salesPeriodView==='monthly'?monthlySales:weeklySales).reduce((s,r)=>s+r.outstanding,0))}</TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 10. Purchase Report */}
        <TabsContent value="purchase-report">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Purchase Report</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">Procurement spend, returns and outstanding by period</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-lg overflow-hidden border">
                    <button
                      onClick={() => setPurchasePeriodView('monthly')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                        purchasePeriodView === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >Monthly</button>
                    <button
                      onClick={() => setPurchasePeriodView('weekly')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                        purchasePeriodView === 'weekly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >Weekly</button>
                  </div>
                  <ExportButtons opts={{
                    title: `Purchase Report (${purchasePeriodView === 'monthly' ? 'Monthly' : 'Weekly'})`,
                    headers: ['Period', 'Orders', 'Suppliers', 'Gross Purchases', 'Returns', 'Net Purchases', 'Paid', 'Outstanding'],
                    rows: (purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).map(r => [
                      r.period, r.orders, r.suppliers,
                      formatCurrency(r.grossPurchases), formatCurrency(r.returns),
                      formatCurrency(r.netPurchases), formatCurrency(r.paid),
                      formatCurrency(r.outstanding),
                    ]),
                    totals: [[
                      'TOTAL', '', '',
                      formatCurrency((purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).reduce((s,r)=>s+r.grossPurchases,0)),
                      formatCurrency((purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).reduce((s,r)=>s+r.returns,0)),
                      formatCurrency((purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).reduce((s,r)=>s+r.netPurchases,0)),
                      formatCurrency((purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).reduce((s,r)=>s+r.paid,0)),
                      formatCurrency((purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).reduce((s,r)=>s+r.outstanding,0)),
                    ]],
                    period: dateFrom && dateTo ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}` : undefined,
                    filename: `purchase-report-${purchasePeriodView}`,
                  }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label:'Total Orders', val:(purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.orders,0).toString() },
                  { label:'Net Purchases', val:formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.netPurchases,0)) },
                  { label:'Paid', val:formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.paid,0)) },
                  { label:'Outstanding', val:formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.outstanding,0)) },
                ].map(k => (
                  <div key={k.label} className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="font-mono font-semibold text-lg">{k.val}</p>
                  </div>
                ))}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Suppliers</TableHead>
                    <TableHead className="text-right">Gross Purchases</TableHead>
                    <TableHead className="text-right">Returns</TableHead>
                    <TableHead className="text-right">Net Purchases</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(purchasePeriodView === 'monthly' ? monthlyPurchases : weeklyPurchases).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.period}</TableCell>
                      <TableCell className="text-right">{r.orders}</TableCell>
                      <TableCell className="text-right">{r.suppliers}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.grossPurchases)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{formatCurrency(r.returns)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatCurrency(r.netPurchases)}</TableCell>
                      <TableCell className="text-right font-mono text-success">{formatCurrency(r.paid)}</TableCell>
                      <TableCell className="text-right font-mono text-warning">{formatCurrency(r.outstanding)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <TableRow className="bg-muted/70 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{(purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.orders,0)}</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-mono">{formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.grossPurchases,0))}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.returns,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.netPurchases,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.paid,0))}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency((purchasePeriodView==='monthly'?monthlyPurchases:weeklyPurchases).reduce((s,r)=>s+r.outstanding,0))}</TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 11. Stock Summary Report */}
        <TabsContent value="stock-summary">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Stock Summary Report</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">Opening, receipts, issues, closing quantities and values</p>
                </div>
                <ExportButtons opts={{
                  title: 'Stock Summary Report',
                  headers: ['Code','Product','Category','Unit','Opening Qty','Received','Issued','Closing Qty','Closing Value','Status'],
                  rows: stockSummary.map(r => [
                    r.code, r.name, r.category, r.unit,
                    r.openingQty.toLocaleString(), r.received.toLocaleString(),
                    r.issued.toLocaleString(), r.closing.toLocaleString(),
                    formatCurrency(r.value), r.status,
                  ]),
                  totals: [['TOTAL', '', '', '',
                    stockSummary.reduce((s,r)=>s+r.openingQty,0).toLocaleString(),
                    stockSummary.reduce((s,r)=>s+r.received,0).toLocaleString(),
                    stockSummary.reduce((s,r)=>s+r.issued,0).toLocaleString(),
                    stockSummary.reduce((s,r)=>s+r.closing,0).toLocaleString(),
                    formatCurrency(totalStockValue), ''
                  ]],
                  period: dateFrom && dateTo ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}` : undefined,
                  filename: 'stock-summary-report',
                }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total SKUs</p>
                  <p className="font-mono font-semibold text-lg">{stockSummary.length}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Closing Value</p>
                  <p className="font-mono font-semibold text-lg">{formatCurrency(totalStockValue)}</p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Items Needing Attention</p>
                  <p className="font-mono font-semibold text-lg text-destructive">{lowStockCount}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Units Issued</p>
                  <p className="font-mono font-semibold text-lg">{stockSummary.reduce((s,r)=>s+r.issued,0).toLocaleString()}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockSummary.map((r) => (
                    <TableRow key={r.code}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.unit}</TableCell>
                      <TableCell className="text-right font-mono">{r.openingQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-success">{r.received > 0 ? `+${r.received.toLocaleString()}` : '–'}</TableCell>
                      <TableCell className="text-right font-mono text-warning">{r.issued.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{r.closing.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.value)}</TableCell>
                      <TableCell>
                        <Badge className={{
                          'Normal':    'bg-success/10 text-success border-success/20',
                          'Low Stock': 'bg-warning/10 text-warning border-warning/20',
                          'Critical':  'bg-destructive/10 text-destructive border-destructive/20',
                        }[r.status] ?? ''}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <TableRow className="bg-muted/70 font-bold">
                    <TableCell colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-right font-mono">{stockSummary.reduce((s,r)=>s+r.openingQty,0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{stockSummary.reduce((s,r)=>s+r.received,0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{stockSummary.reduce((s,r)=>s+r.issued,0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{stockSummary.reduce((s,r)=>s+r.closing,0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totalStockValue)}</TableCell>
                    <TableCell />
                  </TableRow>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. Receipt Register */}
        <TabsContent value="receipt-register">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Receipt Register</CardTitle><ExportButtons /></div></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt #</TableHead><TableHead>Customer</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Issued By</TableHead></TableRow></TableHeader>
                <TableBody>
                  {receiptRegister.map(r => (
                    <TableRow key={r.receiptNo}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono">{r.receiptNo}</TableCell>
                      <TableCell>{r.customer}</TableCell>
                      <TableCell className="truncate max-w-xs">{r.desc}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(r.amount, r.currency as any)}</TableCell>
                      <TableCell>{r.by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}