import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { taskService } from '../services/task.service';

const router = Router();
router.use(authenticate);

// GET /api/v1/tasks?projectId=xxx
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        projectId,
        status,
        priority,
        assigneeId,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      if (!projectId) {
        ApiResponse.badRequest(res, 'projectId is required');
        return;
      }

      const result = await taskService.findByProject(projectId as string, {
        status: status as any,
        priority: priority as any,
        assigneeId: assigneeId as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
      });

      ApiResponse.paginated(res, result.tasks, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/tasks
router.post(
  '/',
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('projectId').notEmpty(),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('status')
      .optional()
      .isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
    body('dueDate').optional().isISO8601().toDate(),
    body('assigneeId').optional().isString(),
    body('tags').optional().isArray(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.create({
        ...req.body,
        creatorId: req.user!.userId,
      });
      ApiResponse.created(res, task, 'Task created');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/tasks/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.findById(req.params.id);
      ApiResponse.success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/v1/tasks/:id
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('status')
      .optional()
      .isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      ApiResponse.success(res, task, 'Task updated');
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/v1/tasks/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskService.delete(req.params.id, req.user!.userId);
      ApiResponse.success(res, null, 'Task deleted');
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/tasks/reorder
router.post(
  '/reorder',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, tasks } = req.body;
      await taskService.reorder(projectId, tasks);
      ApiResponse.success(res, null, 'Tasks reordered');
    } catch (err) {
      next(err);
    }
  }
);

export default router;