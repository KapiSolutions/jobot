import type { ScrapperOptions, JobOffer } from "../types/main";
import ScrapperNoFluffJobs from "../bot/scrapper/scrapperNoFluffJobs";
import ScrapperTheProtocol from "../bot/scrapper/scrapperTheProtocol";
import saveJson from "./saveJson";
import saveCsv from "./saveCsv";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const findOffers = async (options: ScrapperOptions): Promise<Array<JobOffer>> => {
  console.log(`👓 Searching for ${options.searchValue} jobs with a limit of ${options.maxRecords} offers per service.`);

  console.log("⚙️  Scrapping NoFluffJobs...");
  const scrappNoFluffJobs = new ScrapperNoFluffJobs(options);
  const noFluffJobs: Array<JobOffer> = await scrappNoFluffJobs.getJobs();

  await sleep(1000);

  console.log("⚙️  Scrapping The:Protocol...");
  const scrappTheProtocol = new ScrapperTheProtocol(options);
  const theProtocol: Array<JobOffer> = await scrappTheProtocol.getJobs();

  const offers = [...noFluffJobs, ...theProtocol];

  if (false) {
    // disable saving data
    saveJson(offers, options);
    saveCsv(offers, options);
  }

  console.log("✔️  Done!");
  return offers;
};

export default findOffers;
