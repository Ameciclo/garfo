import { seedCities } from "./modules/global/seed_cities";
import { seedCyclistCount } from "./modules/cyclist_count/seed";
import { seedCyclistInfra } from "./modules/cyclist_infra/seed";
import { seedPCRStreets } from "./modules/global/seed_pcr_streets";
import { seedCrashes, seedDatasusDeaths } from "./modules/casualties/casusalties_seed";

async function runAll() {
  console.log("▶️ Starting all seeds...");
  await seedCities();
  await seedCyclistInfra();
  await seedCyclistCount();
  await seedPCRStreets();
  await seedCrashes();
  await seedDatasusDeaths();
  console.log("🎉 All seeds completed.");
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
