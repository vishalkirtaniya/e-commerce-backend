"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Resolve .env from project root regardless of where this file lives
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
console.log("dbPassword:", process.env.PGPASSWORD);
const pool = new pg_1.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER,
    password: String(process.env.PGPASSWORD), // String() prevents SASL undefined error
    database: process.env.PGDATABASE || "postgres",
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true,
});
pool.on("connect", () => console.log("✅ DB connected"));
pool.on("error", (err) => console.error("❌ DB pool error:", err.message));
exports.default = pool;
//# sourceMappingURL=db.js.map