import { seedCyclistInfra } from "./cyclist_infra/seed";
import { seedCyclistCount } from "./cyclist_count/seed";
import { seedAllStreets } from "./streets/seed";
import { seedCrashes, seedDatasusDeaths } from "./traffic_casualties/seed";
import { seedGlobal } from "./global/seed";

async function runAll() {
  console.log("▶️ Starting all seeds...");
  await seedGlobal();
  await seedCyclistInfra();
  await seedCyclistCount();
  await seedAllStreets();
  await seedCrashes();
  await seedDatasusDeaths();
  console.log("🎉 All seeds completed.");
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
