export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    assignedTasks: number;
    createdTasks: number;
    ownedProjects: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'role'>;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate?: string;
  color: string;
  ownerId: string;
  owner: Pick<User, 'id' | 'name' | 'avatar' | 'email'>;
  members: ProjectMember[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number; members: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  position: number;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  assignee?: Pick<User, 'id' | 'name' | 'avatar' | 'email'>;
  creator: Pick<User, 'id' | 'name' | 'avatar'>;
  project?: Pick<Project, 'id' | 'title'>;
  comments?: Comment[];
  subtasks?: Subtask[];
  activityLogs?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; subtasks: number };
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  projectId?: string;
  taskId?: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  project?: Pick<Project, 'id' | 'title' | 'color'>;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    productivity: number;
  };
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  tasksByPriority: Array<{ priority: Priority; count: number }>;
  recentActivity: ActivityLog[];
  upcomingDeadlines: Task[];
  teamStats: User[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
