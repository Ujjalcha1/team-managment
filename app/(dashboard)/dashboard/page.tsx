'use client';
import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Users, TrendingUp, TrendingDown, UserCheck, UserX, Building2,
  Plus, ArrowUpRight, Activity, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const statusIcon = (action: string) => {
  if (action.includes('created') || action.includes('registered')) return <div className="w-2 h-2 rounded-full bg-green-500" />;
  if (action.includes('deleted')) return <div className="w-2 h-2 rounded-full bg-red-500" />;
  if (action.includes('updated') || action.includes('uploaded')) return <div className="w-2 h-2 rounded-full bg-blue-500" />;
  return <div className="w-2 h-2 rounded-full bg-primary" />;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { overview, departments, growth, roles, activity, isLoading, fetchAll } = useAnalyticsStore();
  const { fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchAll();
    fetchEmployees({ limit: 5 });
  }, [fetchAll, fetchEmployees]);

  const stats = [
    {
      label: 'Total Employees',
      value: overview?.totalEmployees ?? '—',
      icon: Users,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      trend: overview?.growthRate,
    },
    {
      label: 'Active',
      value: overview?.activeEmployees ?? '—',
      icon: UserCheck,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'On Leave',
      value: overview?.onLeave ?? '—',
      icon: UserX,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Departments',
      value: overview?.totalDepartments ?? '—',
      icon: Building2,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your team overview
          </p>
        </div>
        <Link href="/employees">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="glass rounded-2xl p-5 space-y-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              {trend !== undefined && (
                <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                  trend >= 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                )}>
                  {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{isLoading ? '...' : value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Team Growth</h3>
              <p className="text-xs text-muted-foreground">New hires over the last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5" />
              <span>Monthly trend</span>
            </div>
          </div>
          {growth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="count" name="New Hires" stroke="#8b5cf6" strokeWidth={2} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : 'No data yet'}
            </div>
          )}
        </div>

        {/* Role Distribution */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Role Distribution</h3>
            <p className="text-xs text-muted-foreground">Breakdown by role</p>
          </div>
          {roles.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={roles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={3}>
                    {roles.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {roles.map(({ role, count }, i) => (
                  <div key={role} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-foreground capitalize">{role}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : 'No data yet'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department chart */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Departments</h3>
            <p className="text-xs text-muted-foreground">Headcount per department</p>
          </div>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departments} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }}
                />
                <Bar dataKey="count" name="Total" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                <Bar dataKey="active" name="Active" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : 'No data yet'}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Latest team actions</p>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-primary">
                View all <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activity.length > 0 ? (
              activity.map((log) => (
                <div key={log._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    {statusIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{log.description}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{format(new Date(log.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
