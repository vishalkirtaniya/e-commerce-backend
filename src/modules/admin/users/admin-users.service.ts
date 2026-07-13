import pool from "../../../services/db.js";
import type { CreateAdminUserBody } from "./admin-users.schema.js";

export async function getAllAdminUsers() {
  const result = await pool.query(`
    SELECT
      au.id,
      au.is_active,
      au.created_at,
      au.updated_at,
      ar.id    AS role_id,
      ar.name  AS role_name,
      ar.label AS role_label,
      uc.id    AS credential_id,
      uc.email,
      up.full_name,
      up.phone
    FROM admin_users au
    JOIN admin_roles ar ON ar.id = au.role_id
    JOIN user_credentials uc ON uc.id = au.credential_id
    LEFT JOIN user_profiles up ON up.id = uc.id
    ORDER BY au.created_at ASC
  `);
  return result.rows.map((r) => ({
    id: r.id,
    is_active: r.is_active,
    created_at: r.created_at,
    updated_at: r.updated_at,
    credential_id: r.credential_id,
    email: r.email,
    full_name: r.full_name,
    phone: r.phone,
    admin_roles: { id: r.role_id, name: r.role_name, label: r.role_label },
  }));
}

export async function getAdminAuditLog(adminUserId: number) {
  const result = await pool.query(
    `
    SELECT id, action, entity, entity_id, payload, ip_address, created_at
    FROM admin_audit_log
    WHERE admin_user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `,
    [adminUserId],
  );
  return result.rows;
}

export async function getAllRoles() {
  const result = await pool.query(
    `SELECT id, name, label FROM admin_roles ORDER BY id ASC`,
  );
  return result.rows;
}

export async function createAdminUser(body: CreateAdminUserBody) {
  // 1. Find credential by email
  const credResult = await pool.query(
    `SELECT id, email FROM user_credentials WHERE email = $1`,
    [body.email],
  );
  if (credResult.rows.length === 0)
    throw new Error("No user found with that email");

  const credential = credResult.rows[0];

  // 2. Check if already an admin
  const existing = await pool.query(
    `SELECT id FROM admin_users WHERE credential_id = $1`,
    [credential.id],
  );
  if (existing.rows.length > 0) throw new Error("User is already an admin");

  // 3. Insert
  const result = await pool.query(
    `INSERT INTO admin_users (credential_id, role_id, is_active)
     VALUES ($1, $2, true)
     RETURNING *`,
    [credential.id, body.role_id],
  );
  return result.rows[0];
}

export async function deactivateAdminUser(id: string) {
  const result = await pool.query(
    `UPDATE admin_users SET is_active = false, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  if (result.rows.length === 0) throw new Error("Admin user not found");
  return result.rows[0];
}

export async function reactivateAdminUser(id: string) {
  const result = await pool.query(
    `UPDATE admin_users SET is_active = true, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  if (result.rows.length === 0) throw new Error("Admin user not found");
  return result.rows[0];
}
