const schedule = require("node-schedule");
import findOffers from "./findOffers";
import { ScrapperOptions } from "../types/main";

const croneSchedule = async () => {
  console.log("⌚ Schedule work started...");
  const options: ScrapperOptions = { searchValue: "Javascript Developer", maxRecords: 5 };

  // Define the CRON expression for 9:00 am on workdays
  const cronExpression = "0 9 * * 1-5";

  // Run schedule
  schedule.scheduleJob(cronExpression, () => {
    findOffers(options);
  });
};

croneSchedule();
