import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config';
import { UserModel } from './models/User';
import { DriverLocationData, ChatMessageData } from './types/socket';

let io: Server;

const driverLocations = new Map<string, DriverLocationData>();
const connectedUsers = new Map<string, string>();
const connectedDrivers = new Map<string, string>();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Token not provided'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { _id: string; email: string; role?: string };
      const user = await UserModel.findById(decoded._id).select('active role');
      if (!user || !user.active) {
        return next(new Error('User inactive or not found'));
      }

      (socket as AuthenticatedSocket).userId = decoded._id;
      (socket as AuthenticatedSocket).userRole = decoded.role || user.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`[Socket] User connected: ${authSocket.userId} (${authSocket.userRole})`);

    if (authSocket.userId) {
      connectedUsers.set(authSocket.userId, socket.id);

      if (authSocket.userRole === 'deliveryman') {
        connectedDrivers.set(authSocket.userId, socket.id);
      }

      socket.join(`user:${authSocket.userId}`);
    }

    socket.on('driver:location_update', async (data: DriverLocationData) => {
      if (!authSocket.userId || authSocket.userRole !== 'deliveryman') {
        return;
      }

      const locationData: DriverLocationData = {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        timestamp: Date.now(),
      };

      driverLocations.set(authSocket.userId, locationData);

      const { DeliverymanModel } = await import('./models/Deliveryman');
      const user = await UserModel.findById(authSocket.userId).select('deliveryman').lean();
      if (user?.deliveryman) {
        await DeliverymanModel.findByIdAndUpdate(user.deliveryman, {
          currentLocation: { type: 'Point', coordinates: [data.lng, data.lat] },
        }).catch(() => {});
      }

      io.emit('driver:location_broadcast', {
        driverId: authSocket.userId,
        location: locationData,
      });

      try {
        const { BookingModel } = await import('./models/Booking');
        const activeBooking = await BookingModel.findOne({
          $or: [
            { driver: user?.deliveryman, driverModel: 'Deliveryman' },
            { driver: user?.driver, driverModel: 'Driver' },
          ],
          status: { $in: ['accepted', 'in_progress'] },
        }).lean();
        if (activeBooking?.client) {
          emitToUser(activeBooking.client.toString(), 'booking:driver_location', {
            bookingId: activeBooking._id,
            location: { lat: data.lat, lng: data.lng },
            heading: data.heading,
            speed: data.speed,
          });
        }
      } catch {}
    });

    socket.on('driver:go_online', async () => {
      if (!authSocket.userId || authSocket.userRole !== 'deliveryman') {
        return;
      }

      const { DeliverymanModel } = await import('./models/Deliveryman');
      const user = await UserModel.findById(authSocket.userId).select('deliveryman').lean();
      if (user?.deliveryman) {
        await DeliverymanModel.findByIdAndUpdate(user.deliveryman, { available: true }).catch(() => {});
      }

      io.emit('driver:status_change', {
        driverId: authSocket.userId,
        online: true,
      });
    });

    socket.on('driver:go_offline', async () => {
      if (!authSocket.userId || authSocket.userRole !== 'deliveryman') {
        return;
      }

      const { DeliverymanModel } = await import('./models/Deliveryman');
      const user = await UserModel.findById(authSocket.userId).select('deliveryman').lean();
      if (user?.deliveryman) {
        await DeliverymanModel.findByIdAndUpdate(user.deliveryman, { available: false }).catch(() => {});
      }

      driverLocations.delete(authSocket.userId);

      io.emit('driver:status_change', {
        driverId: authSocket.userId,
        online: false,
      });
    });

    socket.on('booking:new_request', (data: { bookingId: string; driverId: string }) => {
      const driverSocketId = connectedDrivers.get(data.driverId);
      if (driverSocketId) {
        io.to(driverSocketId).emit('booking:ride_request', {
          bookingId: data.bookingId,
        });
      }
    });

    socket.on('booking:accept', (data: { bookingId: string; driverId: string }) => {
      io.emit('booking:accepted', {
        bookingId: data.bookingId,
        driverId: data.driverId,
      });
      io.emit('booking:ride_taken', {
        bookingId: data.bookingId,
      });
    });

    socket.on('booking:reject', (data: { bookingId: string; driverId: string }) => {
      io.emit('booking:rejected', {
        bookingId: data.bookingId,
        driverId: data.driverId,
      });
    });

    socket.on('booking:start', (data: { bookingId: string; clientId: string }) => {
      const clientSocketId = connectedUsers.get(data.clientId);
      if (clientSocketId) {
        io.to(clientSocketId).emit('booking:in_progress', {
          bookingId: data.bookingId,
        });
      }
    });

    socket.on('booking:complete', (data: { bookingId: string; clientId: string }) => {
      const clientSocketId = connectedUsers.get(data.clientId);
      if (clientSocketId) {
        io.to(clientSocketId).emit('booking:completed', {
          bookingId: data.bookingId,
        });
      }
    });

    socket.on('booking:cancel', (data: { bookingId: string; targetUserId: string }) => {
      const targetSocketId = connectedUsers.get(data.targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('booking:cancelled', {
          bookingId: data.bookingId,
        });
      }
    });

    socket.on('chat:message', (data: ChatMessageData) => {
      const room = `booking:${data.bookingId}`;
      io.to(room).emit('chat:new_message', {
        bookingId: data.bookingId,
        senderId: data.senderId,
        message: data.message,
        timestamp: data.timestamp,
      });
    });

    socket.on('chat:join_booking', (data: { bookingId: string }) => {
      socket.join(`booking:${data.bookingId}`);
    });

    socket.on('chat:leave_booking', (data: { bookingId: string }) => {
      socket.leave(`booking:${data.bookingId}`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] User disconnected: ${authSocket.userId} (${reason})`);

      if (authSocket.userId) {
        connectedUsers.delete(authSocket.userId);

        if (authSocket.userRole === 'deliveryman') {
          connectedDrivers.delete(authSocket.userId);
          driverLocations.delete(authSocket.userId);
        }
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function getDriverLocation(driverId: string): DriverLocationData | undefined {
  return driverLocations.get(driverId);
}

export function getAllOnlineDrivers(): string[] {
  return Array.from(connectedDrivers.keys());
}

export function isUserConnected(userId: string): boolean {
  return connectedUsers.has(userId);
}

export function emitToUser(userId: string, event: string, data: any): void {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
}

export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}
