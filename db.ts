import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema"; // Ajuste o caminho para seu arquivo de esquema
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: "postgresql://postgres:1234@db:5432/postgres" });

export const db = drizzle<typeof schema>(pool, { schema });
