import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
    private io: SocketIOServer | null = null;

    initialize(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.DASHBOARD_URL || 'http://localhost:3001',
                methods: ['GET', 'POST'],
            },
            path: '/socket.io',
        });

        this.io.on('connection', (socket) => {
            console.log(`[Socket.io] Client connected: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`[Socket.io] Client disconnected: ${socket.id}`);
            });
        });

        console.log('[Socket.io] Server initialized');
    }

    // Emit events to all connected clients
    emit(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
            console.log(`[Socket.io] Emitted event: ${event}`, data);
        }
    }

    getIO(): SocketIOServer | null {
        return this.io;
    }
}

// Singleton instance
export const socketService = new SocketService();
