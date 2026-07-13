import pool from "../../services/db";
import redis from "../../services/redis";
import { hashPassword, comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from "../../utils/jwt";
import { sendOtpEmail } from "../../services/mailer";
import crypto from "crypto";
import type {
  SignupInput,
  SigninInput,
  ForgotPasswordInput,
  VerifyOtpInput,
  ResetPasswordInput,
} from "./auth.schema";

// ── Custom error for known business-rule failures ───────────────
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

// ── OTP helpers ─────────────────────────────────────────────────
function generateOtp(): string {
  const bytes = crypto.randomBytes(4);
  const rand = bytes.readUInt32BE(0) % 900000;
  return (100000 + rand).toString();
}

function otpExpiresAt(): Date {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ── SIGNUP ───────────────────────────────────────────────────────
export async function signup(input: SignupInput) {
  const { full_name, email, password, phone } = input;

  const existing = await pool.query(
    "SELECT id FROM user_credentials WHERE email = $1",
    [email],
  );
  if (existing.rows.length > 0) {
    throw new AuthServiceError("Email already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const credResult = await client.query(
      `INSERT INTO user_credentials (email, password_hash)
       VALUES ($1, $2)
       RETURNING id`,
      [email, passwordHash],
    );
    const userId: string = credResult.rows[0].id;

    await client.query(
      `INSERT INTO user_profiles (id, full_name, phone)
       VALUES ($1, $2, $3)`,
      [userId, full_name, phone ?? null],
    );

    await client.query("COMMIT");

    const accessToken = signAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    await redis.set(`refresh:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    return {
      user: { id: userId, email, full_name },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── SIGNIN ───────────────────────────────────────────────────────
export async function signin(input: SigninInput) {
  const { email, password } = input;

  const result = await pool.query(
    `SELECT uc.id, uc.email, uc.password_hash, up.full_name
     FROM user_credentials uc
     JOIN user_profiles up ON up.id = uc.id
     WHERE uc.email = $1`,
    [email],
  );

  if (result.rows.length === 0) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const user = result.rows[0];

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  await redis.set(`refresh:${user.id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

  return {
    user: { id: user.id, email: user.email, full_name: user.full_name },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

// ── REFRESH ──────────────────────────────────────────────────────
export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError("Invalid or expired refresh token", 401);
  }

  const { userId, email } = payload;

  const stored = await redis.get(`refresh:${userId}`);
  if (!stored || stored !== refreshToken) {
    throw new AuthServiceError(
      "Refresh token has been revoked or rotated",
      401,
    );
  }

  const newAccessToken = signAccessToken({ userId, email });
  const newRefreshToken = signRefreshToken({ userId, email });

  await redis.set(`refresh:${userId}`, newRefreshToken, "EX", 7 * 24 * 60 * 60);

  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  };
}

// ── LOGOUT ───────────────────────────────────────────────────────
export async function logout(userId: string, accessToken: string) {
  const ttl = getTokenExpiry(accessToken);
  if (ttl > 0) {
    await redis.set(`blocklist:${accessToken}`, "1", "EX", ttl);
  }

  await redis.del(`refresh:${userId}`);

  return { message: "Logged out successfully" };
}

// ── FORGOT PASSWORD ──────────────────────────────────────────────
export async function sendForgotPasswordOtp(
  input: ForgotPasswordInput,
): Promise<void> {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `SELECT id FROM public.user_credentials WHERE email = $1 LIMIT 1`,
      [input.email],
    );

    // Silently return — prevents email enumeration
    if (userResult.rowCount === 0) return;

    const otp = generateOtp();
    const otpHash = await hashPassword(otp); // reuse your existing util
    const expiresAt = otpExpiresAt();

    await client.query(
      `INSERT INTO public.password_reset_otps (email, otp_hash, expires_at, used)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (email)
       DO UPDATE SET
         otp_hash   = EXCLUDED.otp_hash,
         expires_at = EXCLUDED.expires_at,
         used       = false,
         created_at = now()`,
      [input.email, otpHash, expiresAt],
    );

    await sendOtpEmail(input.email, otp);
  } finally {
    client.release();
  }
}

// ── VERIFY OTP ───────────────────────────────────────────────────
export async function verifyOtp(input: VerifyOtpInput): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT otp_hash, expires_at, used
       FROM public.password_reset_otps
       WHERE email = $1 LIMIT 1`,
      [input.email],
    );

    if (result.rowCount === 0) {
      throw new AuthServiceError("Invalid or expired OTP");
    }

    const record = result.rows[0];

    if (record.used) {
      throw new AuthServiceError("OTP has already been used");
    }

    if (new Date() > new Date(record.expires_at)) {
      throw new AuthServiceError("OTP has expired. Please request a new one");
    }

    // reuse comparePassword — both use bcrypt under the hood
    const isValid = await comparePassword(input.otp, record.otp_hash);
    if (!isValid) {
      throw new AuthServiceError("Invalid OTP. Please try again");
    }
  } finally {
    client.release();
  }
}

// ── RESET PASSWORD ───────────────────────────────────────────────
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT otp_hash, expires_at, used
       FROM public.password_reset_otps
       WHERE email = $1 LIMIT 1`,
      [input.email],
    );

    if (result.rowCount === 0) {
      throw new AuthServiceError("Invalid or expired OTP");
    }

    const record = result.rows[0];

    if (record.used) {
      throw new AuthServiceError("OTP has already been used");
    }

    if (new Date() > new Date(record.expires_at)) {
      throw new AuthServiceError("OTP has expired. Please request a new one");
    }

    const isValid = await comparePassword(input.otp, record.otp_hash);
    if (!isValid) {
      throw new AuthServiceError("Invalid OTP");
    }

    const newPasswordHash = await hashPassword(input.new_password);

    const updateResult = await client.query(
      `UPDATE public.user_credentials
       SET password_hash = $1
       WHERE email = $2
       RETURNING id`,
      [newPasswordHash, input.email],
    );

    if (updateResult.rowCount === 0) {
      throw new AuthServiceError("User not found");
    }

    await client.query(
      `UPDATE public.password_reset_otps SET used = true WHERE email = $1`,
      [input.email],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
