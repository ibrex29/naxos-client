import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; 

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  loading?: boolean; 
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  status,
  className,
  loading = false 
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-l-success';
      case 'warning':
        return 'border-l-warning';
      case 'danger':
        return 'border-l-destructive';
      case 'info':
        return 'border-l-info';
      default:
        return 'border-l-transparent';
    }
  };

  // skeleton loader
  if (loading) {
    return (
      <Card className={cn(
        'border-l-4',
        getStatusColor(),
        className
      )}>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'border-l-4',
      getStatusColor(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {trend && (
            <div className={cn('flex items-center space-x-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend?.period && (
            <p className="text-xs text-muted-foreground">vs {trend.period}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}