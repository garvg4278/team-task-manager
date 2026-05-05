'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi, commentsApi } from '@/services/api';
import { Task, Comment, ProjectMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  cn, formatDate, timeAgo, getInitials, priorityColors,
  statusColors, statusLabels
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  taskId: string;
  members: ProjectMember[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailDialog({ taskId, members, onClose, onUpdate, onDelete }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    tasksApi.getById(taskId).then(({ data }) => {
      setTask(data.data);
    }).finally(() => setLoading(false));
  }, [taskId]);

  const handleStatusChange = async (status: string) => {
    if (!task) return;
    try {
      const { data } = await tasksApi.update(task.id, { status });
      setTask(data.data);
      onUpdate(data.data);
    } catch { toast.error('Failed to update status'); }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!task) return;
    try {
      const { data } = await tasksApi.update(task.id, { assigneeId: assigneeId === 'unassigned' ? null : assigneeId });
      setTask(data.data);
      onUpdate(data.data);
    } catch { toast.error('Failed to update assignee'); }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    setSubmittingComment(true);
    try {
      const { data } = await commentsApi.create({ content: comment, taskId: task.id });
      setTask((prev) => prev ? { ...prev, comments: [...(prev.comments || []), data.data] } : null);
      setComment('');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(task.id);
      onDelete(task.id);
      onClose();
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading || !task ? (
          <div className="space-y-4 p-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3 pr-6">
                <DialogTitle className="text-xl leading-snug">{task.title}</DialogTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-6">
              {/* Main content */}
              <div className="col-span-2 space-y-4">
                {task.description && (
                  <div>
                    <h4 className="mb-1.5 text-sm font-semibold text-muted-foreground">Description</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                    Comments ({task.comments?.length || 0})
                  </h4>
                  <div className="space-y-3 mb-3">
                    {task.comments?.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={c.author.avatar} />
                          <AvatarFallback className="text-xs">{getInitials(c.author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-lg bg-muted/50 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">{c.author.name}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      className="resize-none text-sm"
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAddComment(); }}
                    />
                    <Button size="icon" className="h-[72px] w-9 shrink-0" onClick={handleAddComment} disabled={submittingComment || !comment.trim()}>
                      {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((s) => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</p>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', priorityColors[task.priority])}>
                    {task.priority}
                  </span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assignee</p>
                  <Select value={task.assigneeId || 'unassigned'} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {task.dueDate && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</p>
                    <span className="text-sm">{formatDate(task.dueDate)}</span>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(task.createdAt)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
