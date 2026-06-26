import crypto from 'crypto';

export const QR_ROTATION_MS = 3000;
const QR_PREFIX = 'ATN';

type ValidRotatingQrToken = {
  valid: true;
  sessionId: string;
  slot: number;
};

type InvalidRotatingQrToken = {
  valid: false;
  sessionId?: string;
  slot?: number;
};

function getQrSlot(timestamp = Date.now()) {
  return Math.floor(timestamp / QR_ROTATION_MS);
}

function getQrExpiry(timestamp = Date.now()) {
  const slot = getQrSlot(timestamp);
  return new Date((slot + 1) * QR_ROTATION_MS);
}

export function createRotatingQrToken(sessionId: string, secret: string, timestamp = Date.now()) {
  const slot = getQrSlot(timestamp);
  const signature = crypto.createHmac('sha256', secret).update(`${sessionId}:${slot}`).digest('hex');
  return {
    token: `${QR_PREFIX}:${sessionId}:${slot}:${signature}`,
    expiresAt: getQrExpiry(timestamp).toISOString(),
    slot,
  };
}

export function verifyRotatingQrToken(token: string, secret: string, allowedSkewSlots = 1) {
  const parts = token.split(':');

  if (parts.length !== 4 || parts[0] !== QR_PREFIX) {
    return { valid: false };
  }

  const [, sessionId, slotText, signature] = parts;
  const slot = Number(slotText);

  if (!sessionId || !Number.isInteger(slot)) {
    return { valid: false };
  }

  const currentSlot = getQrSlot();
  const minSlot = currentSlot - allowedSkewSlots;
  const maxSlot = currentSlot;

  if (slot < minSlot || slot > maxSlot) {
    return { valid: false, sessionId, slot };
  }

  const expected = crypto.createHmac('sha256', secret).update(`${sessionId}:${slot}`).digest('hex');
  const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  return valid ? ({ valid: true, sessionId, slot } satisfies ValidRotatingQrToken) : ({ valid: false, sessionId, slot } satisfies InvalidRotatingQrToken);
}
