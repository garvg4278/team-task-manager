import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { dbUser?: any };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      ApiResponse.unauthorized(res, 'No token provided');
      return;
    }

    const decoded = verifyAccessToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      ApiResponse.unauthorized(res, 'User not found or inactive');
      return;
    }

    req.user = { ...decoded, dbUser: user };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ApiResponse.unauthorized(res, 'Token expired');
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      ApiResponse.unauthorized(res, 'Invalid token');
      return;
    }
    ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      ApiResponse.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

// Check if user is admin of a specific project
export const requireProjectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user?.userId;

    if (!userId || !projectId) {
      ApiResponse.badRequest(res, 'Missing required parameters');
      return;
    }

    // Global admins can do anything
    if (req.user?.role === Role.ADMIN) {
      next();
      return;
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member || member.role !== Role.ADMIN) {
      ApiResponse.forbidden(res, 'Project admin access required');
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is a member of the project
export const requireProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.user?.userId;

    if (!userId || !projectId) {
      ApiResponse.badRequest(res, 'Missing required parameters');
      return;
    }

    // Global admins can access all projects
    if (req.user?.role === Role.ADMIN) {
      next();
      return;
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      ApiResponse.forbidden(res, 'You are not a member of this project');
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
