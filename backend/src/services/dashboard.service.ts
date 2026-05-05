import { prisma } from '../lib/prisma';

export class DashboardService {
  async getStats(userId: string, userRole: string) {
    const projectWhere = userRole === 'ADMIN'
      ? {}
      : { members: { some: { userId } } };

    const taskWhere = userRole === 'ADMIN'
      ? {}
      : { project: { members: { some: { userId } } } };

    const now = new Date();

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      recentActivity,
      upcomingDeadlines,
      teamStats,
    ] = await Promise.all([
      // Project counts
      prisma.project.count({ where: projectWhere }),
      prisma.project.count({ where: { ...projectWhere, status: 'ACTIVE' } }),

      // Task counts
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: { not: 'COMPLETED' } } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      }),

      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        where: taskWhere,
        _count: true,
      }),

      // Tasks by priority
      prisma.task.groupBy({
        by: ['priority'],
        where: taskWhere,
        _count: true,
      }),

      // Recent activity
      prisma.activityLog.findMany({
        where: userRole === 'ADMIN' ? {} : {
          project: { members: { some: { userId } } },
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, title: true, color: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Upcoming deadlines (next 7 days)
      prisma.task.findMany({
        where: {
          ...taskWhere,
          dueDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { not: 'COMPLETED' },
        },
        include: {
          project: { select: { id: true, title: true, color: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),

      // Team member productivity (admin only)
      userRole === 'ADMIN'
        ? prisma.user.findMany({
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
              _count: {
                select: {
                  assignedTasks: true,
                  createdTasks: true,
                },
              },
            },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    const productivity = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivity,
      },
      tasksByStatus: tasksByStatus.map((t) => ({
        status: t.status,
        count: t._count,
      })),
      tasksByPriority: tasksByPriority.map((t) => ({
        priority: t.priority,
        count: t._count,
      })),
      recentActivity,
      upcomingDeadlines,
      teamStats,
    };
  }

  async getProjectsOverview(userId: string, userRole: string) {
    const where = userRole === 'ADMIN'
      ? {}
      : { members: { some: { userId } } };

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, members: true } },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      priority: p.priority,
      color: p.color,
      dueDate: p.dueDate,
      memberCount: p._count.members,
      taskCount: p._count.tasks,
      completedTasks: p.tasks.filter((t) => t.status === 'COMPLETED').length,
      progress: p._count.tasks > 0
        ? Math.round((p.tasks.filter((t) => t.status === 'COMPLETED').length / p._count.tasks) * 100)
        : 0,
    }));
  }
}

export const dashboardService = new DashboardService();
