import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res: any, next: any) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    ApiResponse.success(res, notifications);
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: any, res: any, next: any) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    ApiResponse.success(res, null);
  } catch (err) { next(err); }
});

router.patch('/mark-all-read', async (req: any, res: any, next: any) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    });
    ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

router.get('/unread-count', async (req: any, res: any, next: any) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.userId, read: false },
    });
    ApiResponse.success(res, { count });
  } catch (err) { next(err); }
});

export default router;
