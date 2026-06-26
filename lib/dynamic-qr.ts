import crypto from 'crypto';

export const QR_ROTATION_MS = 6000;
const QR_PREFIX = 'ATN';
export const QR_TOKEN_SECRET =
  process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

type ValidRotatingQrToken = {
  valid: true;
  sessionId: string;
  slot: number;
  nonce: number;
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

export function createRotatingQrToken(
  sessionId: string,
  secret: string,
  nonce = 0,
  timestamp = Date.now()
) {
  const slot = getQrSlot(timestamp);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${sessionId}:${slot}:${nonce}`)
    .digest('hex');
  return {
    token: `${QR_PREFIX}:${sessionId}:${slot}:${nonce}:${signature}`,
    expiresAt: getQrExpiry(timestamp).toISOString(),
    slot,
    nonce,
  };
}

export function verifyRotatingQrToken(token: string, secret: string, allowedSkewSlots = 2) {
  const parts = token.trim().split(':');

  if (parts.length !== 5 || parts[0] !== QR_PREFIX) {
    return { valid: false };
  }

  const [, sessionId, slotText, nonceText, signature] = parts;
  const slot = Number(slotText);
  const nonce = Number(nonceText);

  if (!sessionId || !Number.isInteger(slot) || !Number.isInteger(nonce)) {
    return { valid: false };
  }

  const currentSlot = getQrSlot();
  const minSlot = currentSlot - allowedSkewSlots;
  const maxSlot = currentSlot;

  if (slot < minSlot || slot > maxSlot) {
    return { valid: false, sessionId, slot };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${sessionId}:${slot}:${nonce}`)
    .digest('hex');
  const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  return valid
    ? ({ valid: true, sessionId, slot, nonce } satisfies ValidRotatingQrToken)
    : ({ valid: false, sessionId, slot } satisfies InvalidRotatingQrToken);
}
