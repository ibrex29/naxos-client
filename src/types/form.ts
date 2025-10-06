import { UserRole } from './enum';

export type Dict = Record<string, string>;
export type DictOf<T> = Record<string, T>;

export type Mode = 'info' | 'success' | 'warning' | 'error';

export type AuthForm = {
  email: string;
  password: string;
  confirm_password?: string;
};

export const rolesMap: Record<string, string> = {
  [UserRole.Admin]: '/dashboard/super-admin/overview',
  [UserRole.Sales]: '/dashboard/sales-admin/create-order',
  [UserRole.Warehouse]: '/dashboard/warehouse-admin/inventory',
  [UserRole.Finance]: '/dashboard/finance-admin/reports',
};

