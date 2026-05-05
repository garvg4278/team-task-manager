'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragEndEvent, DragOverEvent, closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Settings, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { projectsApi, tasksApi } from '@/services/api';
import { Project, Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/tasks/task-card';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { cn, getInitials, statusLabels } from '@/lib/utils';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'REVIEW', label: 'In Review', color: 'bg-purple-50 dark:bg-purple-950/20' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-green-50 dark:bg-green-950/20' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('TODO');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          projectsApi.getById(id),
          tasksApi.getByProject(id, { limit: 100 }),
        ]);
        setProject(projRes.data.data);
        setTasks(tasksRes.data.data);
      } catch { toast.error('Failed to load project'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === e.active.id) || null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);
    const overColumn = COLUMNS.find((c) => c.id === over.id);

    if (!activeTask) return;

    let newStatus = activeTask.status;
    if (overColumn) newStatus = overColumn.id;
    else if (overTask) newStatus = overTask.status;

    // Update local state optimistically
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === active.id ? { ...t, status: newStatus } : t
      );
      return updated;
    });

    try {
      await tasksApi.update(activeTask.id, { status: newStatus });
    } catch {
      toast.error('Failed to update task');
      // Revert
      setTasks((prev) => prev.map((t) => t.id === activeTask.id ? activeTask : t));
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
    setShowCreateTask(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  if (loading) return <ProjectSkeleton />;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <h1 className="text-xl font-bold">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={m.user.avatar} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(m.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{project.members.length - 4}
              </div>
            )}
          </div>

          <Button onClick={() => { setCreateStatus('TODO'); setShowCreateTask(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div key={col.id} className={cn('flex w-72 shrink-0 flex-col rounded-xl', col.color)}>
                {/* Column header */}
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{col.label}</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {colTasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => { setCreateStatus(col.id); setShowCreateTask(true); }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Tasks */}
                <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2 p-2 min-h-[100px]">
                    <AnimatePresence>
                      {colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          members={project.members}
                          onUpdate={handleTaskUpdated}
                          onDelete={handleTaskDeleted}
                        />
                      ))}
                    </AnimatePresence>
                    {colTasks.length === 0 && (
                      <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-border/50 text-xs text-muted-foreground">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard
                task={activeTask}
                members={project.members}
                onUpdate={() => {}}
                onDelete={() => {}}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={showCreateTask}
        defaultStatus={createStatus}
        projectId={id}
        members={project.members}
        onClose={() => setShowCreateTask(false)}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-2 rounded-xl bg-muted/30 p-3">
            <Skeleton className="h-6 w-24" />
            {Array(3).fill(0).map((_, j) => <Skeleton key={j} className="h-20 rounded-lg" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
