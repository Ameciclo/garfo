import { seedPublic } from "./public/seed";
import { seedCyclistInfra } from "./cyclist_infra/seed";
import { seedCyclistCount } from "./cyclist_count/seed";
import { seedPrefStreets } from "./streets/seed";
import { seedCrashes } from "./traffic_crashes/seed";

async function runAll() {
  console.log("▶️ Starting all seeds...");
  await seedPublic();
  await seedCyclistInfra();
  await seedCyclistCount();
  await seedPrefStreets();
  await seedCrashes();
  console.log("🎉 All seeds completed.");
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
