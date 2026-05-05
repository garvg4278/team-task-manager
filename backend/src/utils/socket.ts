import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './jwt';
import { logger } from './logger';

export const initSocketIO = (io: Server) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Socket connected: ${user.userId}`);

    // Join user's personal room
    socket.join(`user:${user.userId}`);

    // Join project rooms
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.debug(`User ${user.userId} joined project ${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ taskId }: { taskId: string }) => {
      socket.broadcast.to(`task:${taskId}`).emit('user:typing', {
        userId: user.userId,
        taskId,
      });
    });

    socket.on('typing:stop', ({ taskId }: { taskId: string }) => {
      socket.broadcast.to(`task:${taskId}`).emit('user:stopped-typing', {
        userId: user.userId,
        taskId,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.userId}`);
    });
  });
};
