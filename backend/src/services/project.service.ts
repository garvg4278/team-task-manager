import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error.middleware';
import { Priority, ProjectStatus, Role } from '@prisma/client';

interface CreateProjectInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  color?: string;
  ownerId: string;
}

interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  dueDate?: Date;
  color?: string;
}

export class ProjectService {
  async create(input: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        ...input,
        members: {
          create: {
            userId: input.ownerId,
            role: Role.ADMIN,
          },
        },
      },
      include: this.getProjectIncludes(),
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATED_PROJECT',
        entityType: 'project',
        entityId: project.id,
        projectId: project.id,
        userId: input.ownerId,
        metadata: { projectTitle: project.title },
      },
    });

    return project;
  }

  async findAll(userId: string, userRole: string) {
    const where = userRole === 'ADMIN'
      ? {}
      : { members: { some: { userId } } };

    return prisma.project.findMany({
      where,
      include: this.getProjectIncludes(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...this.getProjectIncludes(),
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true, email: true } },
            creator: { select: { id: true, name: true, avatar: true } },
            _count: { select: { comments: true, subtasks: true } },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!project) throw new AppError('Project not found', 404);

    // Check access
    if (userRole !== 'ADMIN') {
      const isMember = project.members.some((m: any) => m.userId === userId);
      if (!isMember) throw new AppError('Access denied', 403);
    }

    return project;
  }

  async update(id: string, input: UpdateProjectInput, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    const updated = await prisma.project.update({
      where: { id },
      data: input,
      include: this.getProjectIncludes(),
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATED_PROJECT',
        entityType: 'project',
        entityId: id,
        projectId: id,
        userId,
        metadata: { changes: Object.keys(input) },
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    await prisma.project.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETED_PROJECT',
        entityType: 'project',
        entityId: id,
        userId,
        metadata: { projectTitle: project.title },
      },
    });
  }

  async addMember(projectId: string, userId: string, role: Role, actorId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Project not found', 404);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) throw new AppError('User is already a member', 409);

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'PROJECT_INVITATION',
        title: 'Added to project',
        message: `You have been added to project "${project.title}"`,
        userId,
        link: `/projects/${projectId}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ADDED_MEMBER',
        entityType: 'project',
        entityId: projectId,
        projectId,
        userId: actorId,
        metadata: { memberName: user.name, memberEmail: user.email },
      },
    });

    return member;
  }

  async removeMember(projectId: string, userId: string, actorId: string) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new AppError('Member not found', 404);

    // Can't remove the only admin
    if (member.role === Role.ADMIN) {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: Role.ADMIN },
      });
      if (adminCount <= 1) throw new AppError('Cannot remove the last admin', 400);
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    
    await prisma.activityLog.create({
      data: {
        action: 'REMOVED_MEMBER',
        entityType: 'project',
        entityId: projectId,
        projectId,
        userId: actorId,
        metadata: { memberName: user?.name },
      },
    });
  }

  async getStats(projectId: string) {
    const [total, byStatus, overdue] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      prisma.task.count({
        where: {
          projectId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
    ]);

    return { total, byStatus, overdue };
  }

  private getProjectIncludes() {
    return {
      owner: { select: { id: true, name: true, avatar: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatar: true, email: true, role: true } },
        },
      },
      _count: { select: { tasks: true, members: true } },
    };
  }
}

export const projectService = new ProjectService();
