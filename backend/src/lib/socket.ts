import { Server } from 'socket.io';

// Singleton Socket.IO instance - avoids circular import from index.ts
let _io: Server | null = null;

export const setIO = (io: Server): void => {
  _io = io;
};

export const getIO = (): Server => {
  if (!_io) {
    throw new Error('Socket.IO not initialized. Call setIO() first in index.ts.');
  }
  return _io;
};
