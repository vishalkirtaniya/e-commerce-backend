import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET          = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN      || '15m';
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET!;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT_SECRET or JWT_REFRESH_SECRET in .env');
}

export interface JwtPayload {
  userId: string;
  email: string;
}

// ── Access token (short-lived: 15m) ──────────────────────────
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ── Refresh token (long-lived: 7d) ───────────────────────────
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

// ── Extract expiry in seconds (for Redis TTL) ─────────────────
export function getTokenExpiry(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number };
  if (!decoded?.exp) return 0;
  return decoded.exp - Math.floor(Date.now() / 1000);
}