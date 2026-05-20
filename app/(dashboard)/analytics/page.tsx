'use client';
import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Users, UserCheck, UserX, Building2, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const actionLabel: Record<string, string> = {
  employee_created: '🟢 Added',
  employee_updated: '🔵 Updated',
  employee_deleted: '🔴 Removed',
  image_uploaded: '📷 Photo',
  user_login: '🔓 Login',
  user_registered: '✨ Registered',
  profile_updated: '✏️ Profile',
};

export default function AnalyticsPage() {
  const { overview, departments, growth, roles, activity, isLoading, fetchAll } = useAnalyticsStore();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statCards = [
    { label: 'Total', value: overview?.totalEmployees, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', trend: overview?.growthRate },
    { label: 'Active', value: overview?.activeEmployees, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Inactive', value: overview?.inactiveEmployees, icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'On Leave', value: overview?.onLeave, icon: UserX, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Depts', value: overview?.totalDepartments, icon: Building2, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'New', value: overview?.newThisMonth, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const Skeleton = ({ className }: { className?: string }) => <div className={cn('bg-muted rounded animate-pulse', className)} />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Workforce insights and trends</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={cn('w-4.5 h-4.5', color)} />
              </div>
              {trend !== undefined && (
                <div className={cn('flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', trend >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500')}>
                  {trend >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            {isLoading ? <div className="space-y-1.5"><Skeleton className="h-6 w-12" /><Skeleton className="h-2.5 w-20" /></div> : (
              <div><p className="text-xl font-bold text-foreground">{value ?? '—'}</p><p className="text-[10px] text-muted-foreground mt-0.5">{label}</p></div>
            )}
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><h2 className="font-semibold text-foreground">Hiring Trend</h2></div>
        </div>
        {isLoading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : growth.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="New Hires" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#grad1)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">No data</div>}
      </div>

      {/* Department & Role Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div><h2 className="font-semibold text-foreground">By Department</h2></div>
          {isLoading ? <Skeleton className="h-[260px] w-full rounded-xl" /> : departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departments} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" name="Total" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                <Bar dataKey="active" name="Active" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground">No data</div>}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div><h2 className="font-semibold text-foreground">By Role</h2></div>
          {isLoading ? <Skeleton className="h-[260px] w-full rounded-xl" /> : roles.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={roles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3}>
                    {roles.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {roles.map(({ role, count }, i) => (
                  <div key={role} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-foreground">{role}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[260px] flex items-center justify-center text-muted-foreground">No data</div>}
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/60">
          <h2 className="font-semibold text-foreground">Activity Log</h2>
        </div>
        <div className="divide-y divide-border/40">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-64" /><Skeleton className="h-2.5 w-32" /></div>
            </div>
          )) : activity.length === 0 ? <div className="text-center py-16 text-muted-foreground">No activity</div> : activity.map((log) => (
            <div key={log._id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium truncate">{actionLabel[log.action] || log.action} · {log.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">By {log.performedByName}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Clock className="w-3 h-3" /> {format(new Date(log.createdAt), 'MMM d, h:mm a')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
