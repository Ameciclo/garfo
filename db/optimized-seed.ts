import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { readCsv } from "./utils";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Aumenta pool de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);

interface SeedProgress {
  module: string;
  table: string;
  completed: boolean;
  lastBatch: number;
  totalRows: number;
  timestamp: string;
}

const PROGRESS_FILE = path.join(__dirname, '.seed-progress.json');
const BATCH_SIZE = 1000; // Processa em lotes de 1000 registros

class OptimizedSeeder {
  private progress: Record<string, SeedProgress> = {};

  constructor() {
    this.loadProgress();
  }

  private loadProgress() {
    try {
      if (fs.existsSync(PROGRESS_FILE)) {
        this.progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar progresso anterior');
      this.progress = {};
    }
  }

  private saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  private getProgressKey(module: string, table: string): string {
    return `${module}_${table}`;
  }

  async seedWithBatching<T>(
    module: string,
    table: string,
    csvPath: string,
    insertFn: (batch: T[]) => Promise<void>,
    transformFn?: (raw: any) => T
  ) {
    const key = this.getProgressKey(module, table);
    
    // Verifica se já foi completado
    if (this.progress[key]?.completed) {
      console.log(`✅ ${table} já foi processado anteriormente`);
      return;
    }

    console.log(`🔄 Processando ${table}...`);
    
    try {
      const rawData = await readCsv(csvPath);
      const totalRows = rawData.length;
      const startBatch = this.progress[key]?.lastBatch || 0;

      // Inicializa progresso
      this.progress[key] = {
        module,
        table,
        completed: false,
        lastBatch: startBatch,
        totalRows,
        timestamp: new Date().toISOString()
      };

      // Processa em batches
      for (let i = startBatch; i < totalRows; i += BATCH_SIZE) {
        const batch = rawData.slice(i, i + BATCH_SIZE);
        const transformedBatch = transformFn 
          ? batch.map(transformFn) 
          : batch as T[];

        // Usa transação para cada batch
        await db.transaction(async (tx) => {
          await insertFn(transformedBatch);
        });

        // Atualiza progresso
        this.progress[key].lastBatch = i + BATCH_SIZE;
        this.saveProgress();

        const percentage = Math.round(((i + BATCH_SIZE) / totalRows) * 100);
        console.log(`  📊 ${table}: ${percentage}% (${i + BATCH_SIZE}/${totalRows})`);
      }

      // Marca como completo
      this.progress[key].completed = true;
      this.saveProgress();
      
      console.log(`✅ ${table} concluído (${totalRows} registros)`);
      
    } catch (error) {
      console.error(`❌ Erro em ${table}:`, error);
      this.saveProgress();
      throw error;
    }
  }

  async resetProgress(module?: string, table?: string) {
    if (module && table) {
      const key = this.getProgressKey(module, table);
      delete this.progress[key];
    } else if (module) {
      Object.keys(this.progress).forEach(key => {
        if (key.startsWith(module)) {
          delete this.progress[key];
        }
      });
    } else {
      this.progress = {};
    }
    this.saveProgress();
    console.log('🔄 Progresso resetado');
  }

  showProgress() {
    console.log('\n📊 Progresso do Seed:');
    Object.values(this.progress).forEach(p => {
      const status = p.completed ? '✅' : '🔄';
      const progress = p.completed ? '100%' : `${Math.round((p.lastBatch / p.totalRows) * 100)}%`;
      console.log(`  ${status} ${p.table}: ${progress} (${p.lastBatch}/${p.totalRows})`);
    });
  }

  async cleanup() {
    await pool.end();
  }
}

export { OptimizedSeeder, BATCH_SIZE };