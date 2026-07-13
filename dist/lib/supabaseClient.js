"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// src/lib/supabaseClient.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false, // not needed server-side
        persistSession: false, // not needed server-side
    },
});
//# sourceMappingURL=supabaseClient.js.map