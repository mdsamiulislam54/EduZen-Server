import cron from "node-cron";
import { generateMonthlyFees } from "../service/generateMonthlyFees";


// Every day 12 AM run
cron.schedule("0 0 1 * *", async () => {
  console.log("Running Monthly Fee Generator...");

  await generateMonthlyFees();

  console.log("Done");
});