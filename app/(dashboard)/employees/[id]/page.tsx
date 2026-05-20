'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, Calendar,
  DollarSign, Pencil, Trash2, Shield, Clock,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  inactive: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  'on-leave': 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
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

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedEmployee, isLoading, fetchEmployee, deleteEmployee, clearSelected } = useEmployeeStore();
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) fetchEmployee(id);
    return () => clearSelected();
  }, [id, fetchEmployee, clearSelected]);

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteEmployee(selectedEmployee._id);
      toast.success('Employee removed');
      router.push('/employees');
    } catch {
      toast.error('Failed to delete employee');
    }
  };

  if (isLoading || !selectedEmployee) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="glass rounded-2xl p-8 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-5 bg-muted rounded-full w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4">
              <div className="h-4 bg-muted rounded w-28" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-muted rounded w-16" />
                    <div className="h-3.5 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const emp = selectedEmployee;
  const isAdmin = user?.role === 'admin';

  const InfoRow = ({ icon: Icon, label, value, color = 'text-muted-foreground' }: {
    icon: any; label: string; value: string | number | undefined; color?: string;
  }) => (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <p className={cn('text-sm font-medium truncate mt-0.5', color)}>{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in-up">
      {/* Back */}
      <Link href="/employees">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </Button>
      </Link>

      {/* Profile Hero */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20 shadow-xl">
              <AvatarImage src={emp.profileImage} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(emp.name)}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background',
              emp.status === 'active' ? 'bg-green-500' : emp.status === 'on-leave' ? 'bg-amber-500' : 'bg-red-500'
            )} />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{emp.name}</h1>
              <p className="text-muted-foreground">{emp.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('text-xs font-semibold px-3 py-1 rounded-full capitalize', roleColors[emp.role])}>
                {emp.role}
              </span>
              <span className={cn('text-xs font-semibold px-3 py-1 rounded-full capitalize border', statusColors[emp.status])}>
                {emp.status}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> {emp.department}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/employees/${emp._id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
              </Link>
              <Button
                variant="outline" size="sm"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact Information</h2>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email Address" value={emp.email} color="text-foreground" />
            <InfoRow icon={Phone} label="Phone Number" value={emp.phone} color="text-foreground" />
            <InfoRow icon={MapPin} label="Address" value={emp.address} color="text-foreground" />
          </div>
        </div>

        {/* Employment Info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Employment Details</h2>
          <div className="space-y-4">
            <InfoRow icon={Building2} label="Department" value={emp.department} color="text-foreground" />
            <InfoRow
              icon={DollarSign}
              label="Monthly Salary"
              value={emp.salary ? `₹${emp.salary.toLocaleString()}` : undefined}
              color="text-foreground"
            />
            <InfoRow
              icon={Calendar}
              label="Joined Date"
              value={emp.joinedDate ? format(new Date(emp.joinedDate), 'MMMM d, yyyy') : undefined}
              color="text-foreground"
            />
          </div>
        </div>

        {/* System Info */}
        <div className="glass rounded-2xl p-6 space-y-5 md:col-span-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">System Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoRow icon={Shield} label="Record ID" value={emp._id} />
            <InfoRow
              icon={Clock}
              label="Created At"
              value={emp.createdAt ? format(new Date(emp.createdAt), 'MMM d, yyyy · h:mm a') : undefined}
            />
            <InfoRow
              icon={Clock}
              label="Last Updated"
              value={emp.updatedAt ? format(new Date(emp.updatedAt), 'MMM d, yyyy · h:mm a') : undefined}
            />
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {emp.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employee's record and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
