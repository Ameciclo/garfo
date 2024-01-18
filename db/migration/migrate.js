"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require("pg"); // Importa a biblioteca pg para lidar com o PostgreSQL
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
/*
// Configure as informações de conexão com o banco de dados
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Nome de usuário do banco de dados
  host: process.env.POSTGRES_HOST, // Endereço do host do banco de dados
  database: process.env.POSTGRES_DATABASE, // Nome do banco de dados
  password: process.env.POSTGRES_PASSWORD, // Senha do banco de dados
  port: process.env.POSTGRES_PORT, // Porta para se conectar ao banco de dados
  ssl: true // Define o uso de SSL para conexão segura (isso depende das configurações do servidor PostgreSQL)
});
*/
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = (0, node_postgres_1.drizzle)(pool);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Migration started");
        yield (0, migrator_1.migrate)(db, { migrationsFolder: "drizzle" });
        console.log("Migration ended");
        process.exit(0);
    });
}
main().catch((err) => {
    console.log(err);
    process.exit(0);
});
