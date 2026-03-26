import pool from '../../services/db';
import redis from '../../services/redis';
import { hashPassword, comparePassword } from '../../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../../utils/jwt';
import type { SignupInput, SigninInput } from './auth.schema';

// ── SIGNUP ────────────────────────────────────────────────────
export async function signup(input: SignupInput) {
  const { full_name, email, password, phone } = input;

  // 1. Check if email already exists in user_profiles via auth.users
  //    We store the hashed password in a separate table since we're managing
  //    auth ourselves (not delegating to Supabase Auth)
  const existing = await pool.query(
    'SELECT id FROM user_credentials WHERE email = $1',
    [email]
  );
  if (existing.rows.length > 0) {
    throw { statusCode: 409, message: 'Email already registered' };
  }

  // 2. Hash password
  const passwordHash = await hashPassword(password);

  // 3. Insert into user_credentials + user_profiles in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert credentials
    const credResult = await client.query(
      `INSERT INTO user_credentials (email, password_hash)
       VALUES ($1, $2)
       RETURNING id`,
      [email, passwordHash]
    );
    const userId: string = credResult.rows[0].id;

    // Insert profile
    await client.query(
      `INSERT INTO user_profiles (id, full_name, phone)
       VALUES ($1, $2, $3)`,
      [userId, full_name, phone ?? null]
    );

    await client.query('COMMIT');

    // 4. Generate tokens
    const accessToken  = signAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    // 5. Store refresh token in Redis (TTL = 7 days)
    await redis.set(
      `refresh:${userId}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60
    );

    return {
      user: { id: userId, email, full_name },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── SIGNIN ────────────────────────────────────────────────────
export async function signin(input: SigninInput) {
  const { email, password } = input;

  // 1. Fetch credentials
  const result = await pool.query(
    `SELECT uc.id, uc.email, uc.password_hash, up.full_name
     FROM user_credentials uc
     JOIN user_profiles up ON up.id = uc.id
     WHERE uc.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const user = result.rows[0];

  // 2. Verify password
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  // 3. Generate tokens
  const accessToken  = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  // 4. Store refresh token in Redis
  await redis.set(
    `refresh:${user.id}`,
    refreshToken,
    'EX',
    7 * 24 * 60 * 60
  );

  return {
    user: { id: user.id, email: user.email, full_name: user.full_name },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

// ── REFRESH ───────────────────────────────────────────────────
export async function refreshTokens(refreshToken: string) {
  // 1. Verify signature
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw { statusCode: 401, message: 'Invalid or expired refresh token' };
  }

  const { userId, email } = payload;

  // 2. Check Redis — token must match what we stored
  const stored = await redis.get(`refresh:${userId}`);
  if (!stored || stored !== refreshToken) {
    throw { statusCode: 401, message: 'Refresh token has been revoked or rotated' };
  }

  // 3. Rotate — issue new pair, delete old
  const newAccessToken  = signAccessToken({ userId, email });
  const newRefreshToken = signRefreshToken({ userId, email });

  await redis.set(
    `refresh:${userId}`,
    newRefreshToken,
    'EX',
    7 * 24 * 60 * 60
  );

  return {
    access_token:  newAccessToken,
    refresh_token: newRefreshToken,
  };
}

// ── LOGOUT ────────────────────────────────────────────────────
export async function logout(userId: string, accessToken: string) {
  // 1. Blocklist the current access token until it naturally expires
  const ttl = getTokenExpiry(accessToken);
  if (ttl > 0) {
    await redis.set(`blocklist:${accessToken}`, '1', 'EX', ttl);
  }

  // 2. Delete refresh token from Redis
  await redis.del(`refresh:${userId}`);

  return { message: 'Logged out successfully' };
}