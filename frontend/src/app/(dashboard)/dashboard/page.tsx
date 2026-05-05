'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, Calendar, Activity
} from 'lucide-react';
import { dashboardApi } from '@/services/api';
import { DashboardStats } from '@/types';
import { formatDate, timeAgo, priorityColors, statusLabels, activityActionLabels } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';

const STATUS_COLORS = {
  TODO: '#94a3b8', IN_PROGRESS: '#3b82f6',
  REVIEW: '#a855f7', COMPLETED: '#22c55e',
};
const PRIORITY_COLORS = {
  LOW: '#3b82f6', MEDIUM: '#f59e0b',
  HIGH: '#f97316', CRITICAL: '#ef4444',
};

const StatCard = ({ icon: Icon, label, value, subtitle, color }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-3 ${color.replace('text-', 'bg-').replace('500', '100').replace('600', '100')} dark:bg-opacity-20`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(({ data }) => {
      setStats(data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats) return null;

  const { overview } = stats;

  const statusChartData = stats.tasksByStatus.map((t) => ({
    name: statusLabels[t.status] || t.status,
    value: t.count,
    color: STATUS_COLORS[t.status as keyof typeof STATUS_COLORS],
  }));

  const priorityChartData = stats.tasksByPriority.map((t) => ({
    name: t.priority,
    count: t.count,
    fill: PRIORITY_COLORS[t.priority as keyof typeof PRIORITY_COLORS],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your team's productivity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Active Projects" value={overview.activeProjects} subtitle={`${overview.totalProjects} total`} color="text-blue-500" />
        <StatCard icon={CheckSquare} label="Completed Tasks" value={overview.completedTasks} subtitle={`${overview.totalTasks} total`} color="text-green-500" />
        <StatCard icon={Clock} label="Pending Tasks" value={overview.pendingTasks} color="text-yellow-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overview.overdueTasks} color="text-red-500" />
      </div>

      {/* Productivity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">Team Productivity</span>
            </div>
            <span className="text-2xl font-bold text-primary">{overview.productivity}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overview.productivity}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {overview.completedTasks} of {overview.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tasks by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Tasks']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tasks by Priority</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines 🎉</p>
            ) : (
              stats.upcomingDeadlines.map((task) => (
                <div key={task.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project?.title}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <Badge variant="outline" className="text-xs">
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </Badge>
                    {task.assignee && (
                      <Avatar className="mt-1 h-5 w-5 ml-auto">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-[10px]">{getInitials(task.assignee.name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={log.user.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(log.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.user.name}</span>{' '}
                    <span className="text-muted-foreground">{activityActionLabels[log.action] || log.action}</span>{' '}
                    {log.project && (
                      <span className="font-medium" style={{ color: log.project.color }}>
                        {log.project.title}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-48" /><Skeleton className="mt-1 h-4 w-64" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
