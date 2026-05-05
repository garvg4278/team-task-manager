'use client';

import { useEffect, useState } from 'react';
import { tasksApi, projectsApi } from '@/services/api';
import { Task } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, isOverdue, priorityColors, statusColors, statusLabels } from '@/lib/utils';
import { AlertTriangle, Calendar } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Get all projects, then get tasks assigned to current user
        const { data: projData } = await projectsApi.getAll();
        const projects = projData.data;
        const allTasks: Task[] = [];
        for (const project of projects.slice(0, 5)) {
          const { data } = await tasksApi.getByProject(project.id, { assigneeId: user?.id, limit: 20 });
          allTasks.push(...data.data);
        }
        setTasks(allTasks);
      } catch {} finally { setLoading(false); }
    };
    if (user) loadTasks();
  }, [user]);

  const grouped = {
    overdue: tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'COMPLETED'),
    active: tasks.filter((t) => !isOverdue(t.dueDate) && t.status !== 'COMPLETED'),
    completed: tasks.filter((t) => t.status === 'COMPLETED'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">{tasks.length} tasks assigned to you</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-6">
          {grouped.overdue.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-500">
                <AlertTriangle className="h-4 w-4" /> Overdue ({grouped.overdue.length})
              </h2>
              <div className="space-y-2">
                {grouped.overdue.map((task) => <TaskRow key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {grouped.active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Active ({grouped.active.length})</h2>
              <div className="space-y-2">
                {grouped.active.map((task) => <TaskRow key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {grouped.completed.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Completed ({grouped.completed.length})</h2>
              <div className="space-y-2">
                {grouped.completed.map((task) => <TaskRow key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No tasks assigned to you</p>
              <p className="text-sm mt-1">Tasks assigned to you will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{task.title}</p>
          {task.project && <p className="text-xs text-muted-foreground">{task.project.title}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityColors[task.priority])}>
            {task.priority}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[task.status])}>
            {statusLabels[task.status]}
          </span>
          {task.dueDate && (
            <span className={cn('flex items-center gap-1 text-xs', isOverdue(task.dueDate) ? 'text-red-500' : 'text-muted-foreground')}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
