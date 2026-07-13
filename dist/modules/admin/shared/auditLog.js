"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const supabaseClient_js_1 = require("../../../lib/supabaseClient.js");
function auditLog({ adminUserId, action, entity, entityId, payload, ipAddress, }) {
    supabaseClient_js_1.supabase
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
        if (error)
            console.error('[auditLog] failed to write:', error.message);
    });
}
//# sourceMappingURL=auditLog.js.map