import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error.middleware';
import { Priority, TaskStatus } from '@prisma/client';
import { getIO } from '../lib/socket';

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  tags?: string[];
  assigneeId?: string;
  projectId: string;
  creatorId: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  tags?: string[];
  assigneeId?: string | null;
  position?: number;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TaskService {
  async create(input: CreateTaskInput) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) throw new AppError('Project not found', 404);

    // Get position (put at end of status column)
    const lastTask = await prisma.task.findFirst({
      where: { projectId: input.projectId, status: input.status || 'TODO' },
      orderBy: { position: 'desc' },
    });
    const position = (lastTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: { ...input, position },
      include: this.getTaskIncludes(),
    });

    // Notify assignee
    if (input.assigneeId && input.assigneeId !== input.creatorId) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New task assigned',
          message: `You have been assigned to "${task.title}"`,
          userId: input.assigneeId,
          link: `/projects/${input.projectId}`,
        },
      });

      // Emit real-time notification
      getIO().to(`user:${input.assigneeId}`).emit('notification', {
        type: 'TASK_ASSIGNED',
        message: `You have been assigned to "${task.title}"`,
      });
    }

    await prisma.activityLog.create({
      data: {
        action: 'CREATED_TASK',
        entityType: 'task',
        entityId: task.id,
        projectId: input.projectId,
        taskId: task.id,
        userId: input.creatorId,
        metadata: { taskTitle: task.title },
      },
    });

    // Emit to project room
    getIO().to(`project:${input.projectId}`).emit('task:created', task);

    return task;
  }

  async findByProject(projectId: string, filters: TaskFilters = {}) {
    const {
      status, priority, assigneeId, search,
      page = 1, limit = 50,
      sortBy = 'position', sortOrder = 'asc',
    } = filters;

    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: this.getTaskIncludes(),
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        ...this.getTaskIncludes(),
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        subtasks: { orderBy: { createdAt: 'asc' } },
        activityLogs: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  async update(id: string, input: UpdateTaskInput, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, status: true, assigneeId: true, projectId: true, title: true },
    });
    if (!task) throw new AppError('Task not found', 404);

    const updated = await prisma.task.update({
      where: { id },
      data: input,
      include: this.getTaskIncludes(),
    });

    // Handle status change notification
    if (input.status && input.status !== task.status) {
      await prisma.activityLog.create({
        data: {
          action: 'STATUS_CHANGED',
          entityType: 'task',
          entityId: id,
          projectId: task.projectId,
          taskId: id,
          userId,
          metadata: { from: task.status, to: input.status, taskTitle: task.title },
        },
      });
    }

    // Notify new assignee
    if (input.assigneeId && input.assigneeId !== task.assigneeId && input.assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'Task assigned to you',
          message: `You have been assigned to "${task.title}"`,
          userId: input.assigneeId,
          link: `/projects/${task.projectId}`,
        },
      });
      getIO().to(`user:${input.assigneeId}`).emit('notification', { type: 'TASK_ASSIGNED' });
    }

    // Emit real-time update
    getIO().to(`project:${task.projectId}`).emit('task:updated', updated);

    return updated;
  }

  async delete(id: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true, title: true },
    });
    if (!task) throw new AppError('Task not found', 404);

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETED_TASK',
        entityType: 'task',
        entityId: id,
        projectId: task.projectId,
        userId,
        metadata: { taskTitle: task.title },
      },
    });

    getIO().to(`project:${task.projectId}`).emit('task:deleted', { id });
  }

  async reorder(projectId: string, taskUpdates: { id: string; position: number; status: TaskStatus }[]) {
    await Promise.all(
      taskUpdates.map(({ id, position, status }) =>
        prisma.task.update({ where: { id }, data: { position, status } })
      )
    );

    getIO().to(`project:${projectId}`).emit('tasks:reordered', taskUpdates);
  }

  private getTaskIncludes() {
    return {
      assignee: { select: { id: true, name: true, avatar: true, email: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      project: { select: { id: true, title: true } },
      _count: { select: { comments: true, subtasks: true } },
    };
  }
}

export const taskService = new TaskService();
