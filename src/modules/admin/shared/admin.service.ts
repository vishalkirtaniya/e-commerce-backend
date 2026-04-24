// src/modules/admin/shared/admin.service.ts
import pool from "../../../services/db.js";
import type { AdminUser } from "../../../types/admin.js";

export async function getAdminWithPermissions(
  credentialId: string,
): Promise<AdminUser | null> {
  try {
    const result = await pool.query(
      `SELECT
        au.id,
        au.is_active,
        ar.name  AS role_name,
        ar.label AS role_label,
        ARRAY_AGG(ap.key) FILTER (WHERE ap.key IS NOT NULL) AS permissions
      FROM admin_users au
      JOIN admin_roles ar ON ar.id = au.role_id
      LEFT JOIN admin_role_permissions arp ON arp.role_id = ar.id
      LEFT JOIN admin_permissions ap ON ap.id = arp.permission_id
      WHERE au.credential_id = $1
      GROUP BY au.id, au.is_active, ar.name, ar.label`,
      [credentialId],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    if (!row.is_active) return null;

    return {
      adminUserId: row.id,
      role: {
        name: row.role_name,
        label: row.role_label,
      },
      permissions: new Set<string>(row.permissions ?? []),
    };
  } catch (err) {
    console.error("[admin.service] DB error1:", err);
    return null;
  }
}
