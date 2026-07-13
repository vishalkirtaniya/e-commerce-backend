"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = adminLogin;
const db_js_1 = __importDefault(require("../../../services/db.js"));
const hash_js_1 = require("../../../utils/hash.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function adminLogin(email, password) {
    console.log(`password: ${password}`);
    // 1. Find credential by email using pg pool (same as existing auth)
    const credResult = await db_js_1.default.query(`SELECT id, email, password_hash FROM user_credentials WHERE email = $1`, [email]);
    if (credResult.rows.length === 0) {
        throw new Error("Invalid email or password");
    }
    const credential = credResult.rows[0];
    console.log(`credential: ${credential.password_hash}`);
    // 2. Verify password using your existing comparePassword util
    const valid = await (0, hash_js_1.comparePassword)(password, credential.password_hash);
    if (!valid) {
        throw new Error("Invalid email or password");
    }
    // 3. Check admin_users table
    const adminResult = await db_js_1.default.query(`SELECT au.id, au.is_active, ar.name as role_name, ar.label as role_label
     FROM admin_users au
     JOIN admin_roles ar ON ar.id = au.role_id
     WHERE au.credential_id = $1`, [credential.id]);
    if (adminResult.rows.length === 0) {
        throw new Error("Access denied: not an active admin");
    }
    const adminUser = adminResult.rows[0];
    if (!adminUser.is_active) {
        throw new Error("Access denied: not an active admin");
    }
    // 4. Sign JWT with same secret — sub = credential id (uuid)
    const token = jsonwebtoken_1.default.sign({ sub: credential.id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return { token };
}
//# sourceMappingURL=admin-auth.service.js.map