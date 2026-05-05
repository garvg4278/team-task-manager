'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, MoreHorizontal, GripVertical, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Task, ProjectMember } from '@/types';
import { tasksApi } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn, formatDate, isOverdue, isDueSoon, getInitials, priorityColors } from '@/lib/utils';
import { TaskDetailDialog } from './task-detail-dialog';

interface Props {
  task: Task;
  members: ProjectMember[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, members, onUpdate, onDelete, isDragging }: Props) {
  const [showDetail, setShowDetail] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(task.id);
      onDelete(task.id);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED';
  const dueSoon = isDueSoon(task.dueDate) && !overdue && task.status !== 'COMPLETED';

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isSortableDragging ? 0.4 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'group relative rounded-lg border border-border bg-card p-3 shadow-sm cursor-pointer',
          'hover:shadow-md hover:border-primary/20 transition-all',
          isDragging && 'shadow-lg border-primary/30'
        )}
        onClick={() => setShowDetail(true)}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Actions */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}>
                Open details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="ml-3">
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Priority */}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', priorityColors[task.priority])}>
                {task.priority}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span className={cn(
                  'flex items-center gap-0.5 text-[10px]',
                  overdue ? 'text-red-500' : dueSoon ? 'text-yellow-600' : 'text-muted-foreground'
                )}>
                  {overdue && <AlertTriangle className="h-3 w-3" />}
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Comment count */}
              {(task._count?.comments ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task._count?.comments}
                </span>
              )}

              {/* Assignee */}
              {task.assignee && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {showDetail && (
        <TaskDetailDialog
          taskId={task.id}
          members={members}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
