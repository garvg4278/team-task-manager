import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../lib/prisma';

export const activityRouter = Router();
activityRouter.use(authenticate);

activityRouter.get('/', async (req: any, res: any, next: any) => {
  try {
    const { projectId, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    else if (req.user.role !== 'ADMIN') {
      where.project = { members: { some: { userId: req.user.userId } } };
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, title: true, color: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.activityLog.count({ where }),
    ]);

    ApiResponse.paginated(res, logs, {
      total, page: parseInt(page), limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
});

export const userRouter = Router();
userRouter.use(authenticate);

userRouter.get('/', async (req: any, res: any, next: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar: true, role: true, isActive: true },
      orderBy: { name: 'asc' },
    });
    ApiResponse.success(res, users);
  } catch (err) { next(err); }
});

userRouter.patch('/profile', async (req: any, res: any, next: any) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, bio, avatar },
      select: { id: true, name: true, email: true, avatar: true, bio: true, role: true },
    });
    ApiResponse.success(res, user, 'Profile updated');
  } catch (err) { next(err); }
});

userRouter.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, avatar: true,
        bio: true, role: true, createdAt: true,
        _count: { select: { assignedTasks: true, createdTasks: true, ownedProjects: true } },
      },
    });
    if (!user) { ApiResponse.notFound(res); return; }
    ApiResponse.success(res, user);
  } catch (err) { next(err); }
});

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/stats', async (req: any, res: any, next: any) => {
  try {
    const { dashboardService } = await import('../services/dashboard.service');
    const stats = await dashboardService.getStats(req.user.userId, req.user.role);
    ApiResponse.success(res, stats);
  } catch (err) { next(err); }
});

dashboardRouter.get('/projects-overview', async (req: any, res: any, next: any) => {
  try {
    const { dashboardService } = await import('../services/dashboard.service');
    const projects = await dashboardService.getProjectsOverview(req.user.userId, req.user.role);
    ApiResponse.success(res, projects);
  } catch (err) { next(err); }
});
