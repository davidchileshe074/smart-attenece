export const REALTIME_CHANNEL = 'smart-attendance:events';

export type RealtimeRoom = `lecturer:${string}` | `session:${string}`;

export type RealtimeCourse = {
  id: string;
  code: string;
  title: string;
};

export type RealtimeStudent = {
  id: string;
  name: string;
  studentId: string;
};

export type AttendanceMarkedPayload = {
  attendanceId: string;
  sessionId: string;
  lecturerId: string;
  course: RealtimeCourse;
  student: RealtimeStudent;
  timestamp: string;
  status: 'present' | 'late';
};

export type SessionCreatedPayload = {
  sessionId: string;
  lecturerId: string;
  course: RealtimeCourse;
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'scheduled';
};

export type SessionExpiredPayload = SessionCreatedPayload;

export type RealtimeEventMap = {
  'attendance:marked': AttendanceMarkedPayload;
  'session:created': SessionCreatedPayload;
  'session:expired': SessionExpiredPayload;
};

export type RealtimeEventName = keyof RealtimeEventMap;

export type RealtimeEnvelope<T extends RealtimeEventName = RealtimeEventName> = {
  type: T;
  timestamp: string;
  payload: RealtimeEventMap[T];
};

