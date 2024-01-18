import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
//import * as schema from "./schema"; // Ajuste o caminho para seu arquivo de esquema

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool);
