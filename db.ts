import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import dotenv from "dotenv";
dotenv.config();

// Usar DATABASE_URL do .env para flexibilidade
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234@db:5432/postgres" 
});

export const db = drizzle<typeof schema>(pool, { schema });
