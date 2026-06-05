import Redis from 'ioredis';
import type { Server as SocketIOServer } from 'socket.io';
import {
  REALTIME_CHANNEL,
  type AttendanceMarkedPayload,
  type RealtimeEnvelope,
  type RealtimeEventMap,
  type RealtimeEventName,
  type SessionCreatedPayload,
  type SessionExpiredPayload,
} from './realtime-types';

type RealtimeState = {
  io: SocketIOServer | null;
  publisher: Redis | null;
  subscriber: Redis | null;
};

declare global {
  var __smartAttendanceRealtime: RealtimeState | undefined;
}

const globalState: RealtimeState =
  globalThis.__smartAttendanceRealtime ||
  (globalThis.__smartAttendanceRealtime = {
    io: null,
    publisher: null,
    subscriber: null,
  });

function getRedisUrl() {
  return process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';
}

function isRedisEnabled() {
  return Boolean(getRedisUrl());
}

function getPublisher() {
  if (!isRedisEnabled()) return null;

  if (!globalState.publisher) {
    globalState.publisher = new Redis(getRedisUrl(), {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
  }

  return globalState.publisher;
}

function getSubscriber() {
  if (!isRedisEnabled()) return null;

  if (!globalState.subscriber) {
    globalState.subscriber = new Redis(getRedisUrl(), {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
  }

  return globalState.subscriber;
}

function emitLocal(envelope: RealtimeEnvelope) {
  const io = globalState.io;
  if (!io) return;

  const payload = envelope.payload as
    | AttendanceMarkedPayload
    | SessionCreatedPayload
    | SessionExpiredPayload;

  if (envelope.type === 'attendance:marked') {
    io.to(`session:${payload.sessionId}`).emit(envelope.type, payload);
    io.to(`lecturer:${payload.lecturerId}`).emit(envelope.type, payload);
    return;
  }

  if (envelope.type === 'session:created' || envelope.type === 'session:expired') {
    io.to(`lecturer:${payload.lecturerId}`).emit(envelope.type, payload);
  }
}

export function attachSocketServer(io: SocketIOServer) {
  globalState.io = io;
}

export async function initRealtimeBridge() {
  const subscriber = getSubscriber();
  if (!subscriber) return;

  if (subscriber.status !== 'ready') {
    await subscriber.connect();
  }

  await subscriber.subscribe(REALTIME_CHANNEL);

  subscriber.removeAllListeners('message');
  subscriber.on('message', (_channel, message) => {
    try {
      const envelope = JSON.parse(message) as RealtimeEnvelope;
      emitLocal(envelope);
    } catch {
      // Ignore malformed messages.
    }
  });
}

export async function closeRealtimeBridge() {
  await Promise.allSettled([
    globalState.publisher?.quit(),
    globalState.subscriber?.quit(),
  ]);

  globalState.publisher = null;
  globalState.subscriber = null;
}

export async function publishRealtimeEvent<T extends RealtimeEventName>(
  type: T,
  payload: RealtimeEventMap[T]
) {
  const envelope: RealtimeEnvelope<T> = {
    type,
    timestamp: new Date().toISOString(),
    payload,
  };

  const publisher = getPublisher();
  if (!publisher) {
    emitLocal(envelope);
    return;
  }

  if (publisher.status !== 'ready') {
    await publisher.connect();
  }

  try {
    await publisher.publish(REALTIME_CHANNEL, JSON.stringify(envelope));
  } catch {
    emitLocal(envelope);
  }
}

export function getRealtimeConfig() {
  return {
    redisEnabled: isRedisEnabled(),
    channel: REALTIME_CHANNEL,
  };
}
