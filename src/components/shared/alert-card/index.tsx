
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Package, Bell } from 'lucide-react';

interface AlertCardProps {
  type: 'low-stock' | 'expiry' | 'pending-approval' | 'system';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AlertCard({
  type,
  title,
  message,
  priority,
  count,
  action,
  className
}: AlertCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'low-stock':
        return <Package className="h-5 w-5" />;
      case 'expiry':
        return <Clock className="h-5 w-5" />;
      case 'pending-approval':
        return <Bell className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (priority) {
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      default:
        return 'destructive';
    }
  };

  const getBorderColor = () => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-info';
    }
  };

  return (
    <Card className={cn(
      'border-l-4',
      getBorderColor(),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {count && (
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            )}
            <Badge variant={getVariant()} className="text-xs capitalize">
              {priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {action && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={action.onClick}
            className="w-full sm:w-auto"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}