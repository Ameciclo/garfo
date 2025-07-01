import csv from "csv-parser";
import fs from "fs";
import { db } from "./connection";

// Re-exporta a conexão centralizada
export { db };

export function readCsv<T = any>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
