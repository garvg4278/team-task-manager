import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        ApiResponse.unauthorized(res, 'No refresh token provided');
        return;
      }

      const result = await authService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, { accessToken: result.accessToken }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const refreshToken = req.cookies.refreshToken;

      await authService.logout(userId, refreshToken);

      res.clearCookie('refreshToken');
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prisma } = await import('../lib/prisma');
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true, email: true, name: true,
          role: true, avatar: true, bio: true,
          isActive: true, emailVerified: true,
          createdAt: true, updatedAt: true,
          _count: {
            select: {
              ownedProjects: true,
              assignedTasks: true,
              createdTasks: true,
            },
          },
        },
      });
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
