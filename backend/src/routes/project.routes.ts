import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireProjectAdmin, requireProjectMember } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { projectService } from '../services/project.service';
import { Role } from '@prisma/client';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET /api/v1/projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await projectService.findAll(req.user!.userId, req.user!.role);
    ApiResponse.success(res, projects);
  } catch (err) { next(err); }
});

// POST /api/v1/projects
router.post(
  '/',
  [
    body('title').trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    body('dueDate').optional().isISO8601().toDate(),
    body('color').optional().isHexColor(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const project = await projectService.create({
        ...req.body,
        ownerId: req.user!.userId,
      });
      ApiResponse.created(res, project, 'Project created');
    } catch (err) { next(err); }
  }
);

// GET /api/v1/projects/:id
router.get('/:id', requireProjectMember, async (req, res, next) => {
  try {
    const project = await projectService.findById(
      req.params.id, req.user!.userId, req.user!.role
    );
    ApiResponse.success(res, project);
  } catch (err) { next(err); }
});

// PATCH /api/v1/projects/:id
router.patch(
  '/:id',
  requireProjectAdmin,
  [
    body('title').optional().trim().notEmpty().isLength({ max: 100 }),
    body('status').optional().isIn(['ACTIVE', 'ARCHIVED', 'COMPLETED']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    validate,
  ],
  async (req, res, next) => {
    try {
      const project = await projectService.update(req.params.id, req.body, req.user!.userId);
      ApiResponse.success(res, project, 'Project updated');
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/projects/:id
router.delete('/:id', requireProjectAdmin, async (req, res, next) => {
  try {
    await projectService.delete(req.params.id, req.user!.userId);
    ApiResponse.success(res, null, 'Project deleted');
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:projectId/members
router.post(
  '/:projectId/members',
  requireProjectAdmin,
  [
    body('userId').notEmpty(),
    body('role').optional().isIn(['ADMIN', 'MEMBER']),
    validate,
  ],
  async (req, res, next) => {
    try {
      const member = await projectService.addMember(
        req.params.projectId,
        req.body.userId,
        req.body.role || Role.MEMBER,
        req.user!.userId,
      );
      ApiResponse.created(res, member, 'Member added');
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/projects/:projectId/members/:userId
router.delete('/:projectId/members/:userId', requireProjectAdmin, async (req, res, next) => {
  try {
    await projectService.removeMember(
      req.params.projectId,
      req.params.userId,
      req.user!.userId,
    );
    ApiResponse.success(res, null, 'Member removed');
  } catch (err) { next(err); }
});

// GET /api/v1/projects/:id/stats
router.get('/:id/stats', requireProjectMember, async (req, res, next) => {
  try {
    const stats = await projectService.getStats(req.params.id);
    ApiResponse.success(res, stats);
  } catch (err) { next(err); }
});

export default router;
