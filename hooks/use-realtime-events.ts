'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
  AttendanceMarkedPayload,
  SessionCreatedPayload,
  SessionExpiredPayload,
} from '@/lib/realtime-types';

type RealtimeHandlers = {
  onAttendanceMarked?: (payload: AttendanceMarkedPayload) => void;
  onSessionCreated?: (payload: SessionCreatedPayload) => void;
  onSessionExpired?: (payload: SessionExpiredPayload) => void;
  onConnect?: (socket: Socket) => void;
  onDisconnect?: () => void;
};

type UseRealtimeEventsOptions = {
  enabled?: boolean;
  lecturerId?: string;
  sessionId?: string;
  handlers?: RealtimeHandlers;
};

export function useRealtimeEvents({
  enabled = true,
  lecturerId,
  sessionId,
  handlers = {},
}: UseRealtimeEventsOptions) {
  const handlersRef = useRef<RealtimeHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });

    if (lecturerId) {
      socket.emit('lecturer:join', lecturerId);
    }

    if (sessionId) {
      socket.emit('session:join', sessionId);
    }

    const handleAttendanceMarked = (payload: AttendanceMarkedPayload) => {
      handlersRef.current.onAttendanceMarked?.(payload);
    };

    const handleSessionCreated = (payload: SessionCreatedPayload) => {
      handlersRef.current.onSessionCreated?.(payload);
    };

    const handleSessionExpired = (payload: SessionExpiredPayload) => {
      handlersRef.current.onSessionExpired?.(payload);
    };

    socket.on('connect', () => {
      handlersRef.current.onConnect?.(socket);
    });
    socket.on('disconnect', () => {
      handlersRef.current.onDisconnect?.();
    });
    socket.on('attendance:marked', handleAttendanceMarked);
    socket.on('session:created', handleSessionCreated);
    socket.on('session:expired', handleSessionExpired);

    return () => {
      socket.off('attendance:marked', handleAttendanceMarked);
      socket.off('session:created', handleSessionCreated);
      socket.off('session:expired', handleSessionExpired);
      socket.disconnect();
    };
  }, [enabled, lecturerId, sessionId]);
}

