'use client';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useAuthStore } from '@/stores/authStore';
import { Employee } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown,
  Pencil, Trash2, Eye, MoreHorizontal, Upload, X,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

const ROLES = ['developer', 'designer', 'manager', 'hr', 'marketing', 'sales', 'finance', 'other'] as const;
const STATUSES = ['active', 'inactive', 'on-leave'] as const;

const schema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Valid email required'),
  role: z.enum(ROLES),
  department: z.string().min(1, 'Department required'),
  status: z.enum(STATUSES),
  phone: z.string().optional(),
  address: z.string().optional(),
  salary: z.coerce.number().min(0).optional(),
  joinedDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const statusColors: Record<string, string> = {
  active: 'bg-green-500/15 text-green-600 dark:text-green-400',
  inactive: 'bg-red-500/15 text-red-600 dark:text-red-400',
  'on-leave': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};
const roleColors: Record<string, string> = {
  developer: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  designer: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  manager: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  hr: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  marketing: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  sales: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  finance: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
};

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const {
    employees, pagination, filters, isLoading, isSubmitting,
    fetchEmployees, createEmployee, updateEmployee, deleteEmployee, uploadImage,
    setPage,
  } = useEmployeeStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { status: 'active' },
  });

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const applyFilters = useCallback(() => {
    fetchEmployees({ search, role: roleFilter, status: statusFilter, page: 1 });
  }, [search, roleFilter, statusFilter, fetchEmployees]);

  useEffect(() => {
    const id = setTimeout(applyFilters, 400);
    return () => clearTimeout(id);
  }, [search, roleFilter, statusFilter, applyFilters]);

  const openAdd = () => {
    reset({ status: 'active' });
    setImageFile(null);
    setImagePreview('');
    setAddOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    reset({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      status: emp.status,
      phone: emp.phone,
      address: emp.address,
      salary: emp.salary,
      joinedDate: emp.joinedDate?.split('T')[0],
    });
    setImagePreview(emp.profileImage || '');
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editEmployee) {
        await updateEmployee(editEmployee._id, data);
        if (imageFile) await uploadImage(editEmployee._id, imageFile);
        toast.success('Employee updated successfully');
        setEditEmployee(null);
      } else {
        const newEmp = await createEmployee(data);
        if (imageFile) await uploadImage(newEmp._id, imageFile);
        toast.success('Employee added successfully');
        setAddOpen(false);
      }
      fetchEmployees();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget._id);
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete employee');
    }
  };

  const isAdmin = user?.role === 'admin';

  const EmployeeForm = () => (
    <form id="emp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image upload */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Avatar className="w-16 h-16 ring-2 ring-border">
            <AvatarImage src={imagePreview} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {getInitials('New')}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
            <Upload className="w-3 h-3 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Full Name *</Label>
          <Input placeholder="John Smith" {...register('name')} />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Email *</Label>
          <Input type="email" placeholder="john@company.com" {...register('email')} />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Role *</Label>
          <Select defaultValue={editEmployee?.role} onValueChange={(v) => setValue('role', v as any)}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select defaultValue={editEmployee?.status ?? 'active'} onValueChange={(v) => setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Department *</Label>
          <Input placeholder="Engineering" {...register('department')} />
          {errors.department && <p className="text-destructive text-xs">{errors.department.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input placeholder="+1 555 0000" {...register('phone')} />
        </div>
        <div className="space-y-1.5">
          <Label>Salary (₹/month)</Label>
          <Input type="number" placeholder="50000" {...register('salary')} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Address</Label>
          <Input placeholder="123 Main St, City" {...register('address')} />
        </div>
        <div className="space-y-1.5">
          <Label>Joined Date</Label>
          <Input type="date" {...register('joinedDate')} />
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pagination.total} team member{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, department..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Select value={roleFilter || 'all'} onValueChange={(v) => setRoleFilter(v === 'all' ? '' : v || '')}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v || '')}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Department</th>
                <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden xl:table-cell">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">Salary <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden xl:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted" />
                        <div className="space-y-1.5">
                          <div className="h-3 bg-muted rounded w-28" />
                          <div className="h-2.5 bg-muted rounded w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell"><div className="h-5 bg-muted rounded-full w-20" /></td>
                    <td className="px-4 py-4 hidden lg:table-cell"><div className="h-3 bg-muted rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-muted rounded-full w-16" /></td>
                    <td className="px-4 py-4 hidden xl:table-cell"><div className="h-3 bg-muted rounded w-16" /></td>
                    <td className="px-4 py-4 hidden xl:table-cell"><div className="h-3 bg-muted rounded w-20" /></td>
                    <td className="px-5 py-4"><div className="h-7 bg-muted rounded w-7 ml-auto" /></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm">Try adjusting your filters or add a new employee</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 ring-2 ring-border shrink-0">
                          <AvatarImage src={emp.profileImage} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', roleColors[emp.role])}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-muted-foreground text-sm">{emp.department}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', statusColors[emp.status])}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-muted-foreground text-sm">
                      {emp.salary ? `₹${emp.salary.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-muted-foreground text-sm">
                      {emp.joinedDate ? format(new Date(emp.joinedDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center rounded-md hover:bg-accent w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity outline-none">
                            <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Link href={`/employees/${emp._id}`} className="cursor-pointer w-full flex items-center">
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(emp)} className="cursor-pointer">
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(emp)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border/60">
            <p className="text-sm text-muted-foreground">
              Showing {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="icon" className="w-8 h-8"
                disabled={filters.page === 1}
                onClick={() => { setPage(filters.page - 1); fetchEmployees({ page: filters.page - 1 }); }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">{filters.page} / {pagination.pages}</span>
              <Button
                variant="outline" size="icon" className="w-8 h-8"
                disabled={filters.page >= pagination.pages}
                onClick={() => { setPage(filters.page + 1); fetchEmployees({ page: filters.page + 1 }); }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" form="emp-form" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editEmployee} onOpenChange={(o) => !o && setEditEmployee(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditEmployee(null)}>Cancel</Button>
            <Button type="submit" form="emp-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employee's record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
