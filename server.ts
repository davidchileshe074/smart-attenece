import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { attachSocketServer, closeRealtimeBridge, initRealtimeBridge } from './lib/realtime';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

async function start() {
  await app.prepare();

  const server = createServer((req, res) => {
    void handle(req, res);
  });

  const io = new SocketIOServer(server, {
    path: '/socket.io',
    cors: {
      origin: true,
      credentials: true,
    },
  });

  attachSocketServer(io);
  try {
    await initRealtimeBridge();
  } catch (error) {
    console.warn('Realtime Redis bridge disabled:', error);
  }

  io.on('connection', (socket) => {
    socket.on('lecturer:join', (lecturerId: string) => {
      if (lecturerId) {
        socket.join(`lecturer:${lecturerId}`);
      }
    });

    socket.on('session:join', (sessionId: string) => {
      if (sessionId) {
        socket.join(`session:${sessionId}`);
      }
    });

    socket.on('session:leave', (sessionId: string) => {
      if (sessionId) {
        socket.leave(`session:${sessionId}`);
      }
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  const shutdown = async () => {
    io.close();
    server.close();
    await closeRealtimeBridge();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void start();
