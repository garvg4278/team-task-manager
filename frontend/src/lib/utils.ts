import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date?: string | null): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}

export function isDueSoon(date?: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  return isWithinInterval(d, { start: new Date(), end: addDays(new Date(), 3) });
}

export const priorityColors: Record<string, string> = {
  LOW: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  MEDIUM: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
  HIGH: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
  CRITICAL: 'text-red-600 bg-red-50 dark:bg-red-950/30',
};

export const statusColors: Record<string, string> = {
  TODO: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
  IN_PROGRESS: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  REVIEW: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
  COMPLETED: 'text-green-600 bg-green-50 dark:bg-green-950/30',
};

export const statusLabels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  COMPLETED: 'Completed',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const projectStatusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  COMPLETED: 'Completed',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarUrl(name: string, avatar?: string): string {
  if (avatar) return avatar;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1&textColor=ffffff`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
}

export const activityActionLabels: Record<string, string> = {
  CREATED_PROJECT: 'created project',
  UPDATED_PROJECT: 'updated project',
  DELETED_PROJECT: 'deleted project',
  ADDED_MEMBER: 'added member to',
  REMOVED_MEMBER: 'removed member from',
  CREATED_TASK: 'created task',
  UPDATED_TASK: 'updated task',
  DELETED_TASK: 'deleted task',
  STATUS_CHANGED: 'changed status of',
  TASK_COMPLETED: 'completed task',
};
