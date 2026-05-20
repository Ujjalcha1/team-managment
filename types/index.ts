export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  profileImage: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  status: EmployeeStatus;
  joinedDate: string;
  profileImage: string;
  phone: string;
  address: string;
  salary: number;
  createdBy: { _id: string; name: string; email: string } | string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeRole = 'developer' | 'designer' | 'manager' | 'hr' | 'marketing' | 'sales' | 'finance' | 'other';
export type EmployeeStatus = 'active' | 'inactive' | 'on-leave';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface EmployeeFilters {
  search: string;
  role: string;
  status: string;
  department: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  entityType: 'employee' | 'user';
  entityId: string;
  entityName: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeave: number;
  totalDepartments: number;
  newThisMonth: number;
  growthRate: number;
}

export interface DepartmentStat {
  name: string;
  count: number;
  active: number;
}

export interface GrowthStat {
  month: string;
  year: number;
  count: number;
}

export interface RoleStat {
  role: string;
  count: number;
}
