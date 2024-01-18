import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/migration/schema"; // Ajuste o caminho para seu arquivo de esquema
import dotenv from 'dotenv';
dotenv.config();

//import * as schema from "./schema"; // Ajuste o caminho para seu arquivo de esquema

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  });
  
export const db = drizzle(pool, {schema});
