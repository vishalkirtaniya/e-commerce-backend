import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Resolve .env from project root regardless of where this file lives
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
console.log("dbPassword:", process.env.PGPASSWORD);

const pool = new Pool({
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

export default pool;
