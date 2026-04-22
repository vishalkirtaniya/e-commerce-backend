// src/services/adminService.ts
import { supabase } from '../lib/supabaseClient.js'
import type { AdminUser } from '../types/admin.js'

// Type the raw shape returned by the nested Supabase v2 select
type AdminPermissionRow = {
  admin_permissions: {
    key: string
    module: string
  } | null
}

type AdminRoleRow = {
  id: number
  name: string
  label: string
  admin_role_permissions: AdminPermissionRow[]
}

type AdminUserRow = {
  id: number
  is_active: boolean
  admin_roles: AdminRoleRow | null  // v2 returns object for !inner, null if missing
}

export async function getAdminWithPermissions(
  credentialId: string
): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      id,
      is_active,
      admin_roles (
        id,
        name,
        label,
        admin_role_permissions (
          admin_permissions (
            key,
            module
          )
        )
      )
    `)
    .eq('credential_id', credentialId)
    .maybeSingle()  // ← use maybeSingle() instead of single() — returns null instead of error when no row found

  if (error) {
    console.error('[getAdminWithPermissions] DB error:', error.message)
    return null
  }

  if (!data || !data.is_active) return null

  const row = data as unknown as AdminUserRow

  if (!row.admin_roles) return null

  const permissions = new Set(
    row.admin_roles.admin_role_permissions
      .map((rp) => rp.admin_permissions?.key)
      .filter((key): key is string => key !== undefined)
  )

  return {
    adminUserId: row.id,
    role: {
      name: row.admin_roles.name,
      label: row.admin_roles.label,
    },
    permissions,
  }
}