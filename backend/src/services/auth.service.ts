import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const { name, email, password } = input;

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true, email: true, name: true,
        role: true, avatar: true, bio: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const { password: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refreshToken(token: string) {
    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check token in DB
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or invalid', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new AppError('User not found', 401);
    }

    // Rotate refresh token (delete old, create new)
    await prisma.refreshToken.delete({ where: { token } });
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } else {
      // Logout from all devices
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { userId, email, role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
