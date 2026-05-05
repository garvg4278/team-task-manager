// comment.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(authenticate);

router.post(
  '/',
  [
    body('content').trim().notEmpty().isLength({ max: 2000 }),
    body('taskId').notEmpty(),
    validate,
  ],
  async (req: any, res: any, next: any) => {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: req.body.content,
          taskId: req.body.taskId,
          authorId: req.user.userId,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      });

      const task = await prisma.task.findUnique({
        where: { id: req.body.taskId },
        select: { assigneeId: true, title: true, projectId: true },
      });

      if (task?.assigneeId && task.assigneeId !== req.user.userId) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT_ADDED',
            title: 'New comment on your task',
            message: `Someone commented on "${task.title}"`,
            userId: task.assigneeId,
            link: `/projects/${task.projectId}`,
          },
        });
      }

      ApiResponse.created(res, comment);
    } catch (err) { next(err); }
  }
);

router.get('/task/:taskId', async (req: any, res: any, next: any) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    ApiResponse.success(res, comments);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: any, res: any, next: any) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) { ApiResponse.notFound(res); return; }
    if (comment.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      ApiResponse.forbidden(res); return;
    }
    await prisma.comment.delete({ where: { id: req.params.id } });
    ApiResponse.success(res, null);
  } catch (err) { next(err); }
});

export default router;
