import { supabase } from '../../../lib/supabaseClient.js'
import type { AuditLogParams } from '../../../types/admin.js'

export function auditLog({
  adminUserId,
  action,
  entity,
  entityId,
  payload,
  ipAddress,
}: AuditLogParams): void {
  supabase
    .from('admin_audit_log')
    .insert({
      admin_user_id: adminUserId,
      action,
      entity,
      entity_id: entityId != null ? String(entityId) : null,
      payload: payload ?? null,
      ip_address: ipAddress ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('[auditLog] failed to write:', error.message)
    })
}