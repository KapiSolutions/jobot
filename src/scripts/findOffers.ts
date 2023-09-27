import type { ScrapperOptions, JobOffer } from "../types/main";
import ScrapperNoFluffJobs from "../bot/scrapper/scrapperNoFluffJobs";
// import ScrapperTheProtocol from "../bot/scrapper/scrapperTheProtocol";
import ScrapperPracujPl from "../bot/scrapper/scrapperPracujPL";
import saveJson from "./saveJson";
import saveCsv from "./saveCsv";

const findOffers = async (options: ScrapperOptions): Promise<Array<JobOffer>> => {
  console.log(`👓 Searching for ${options.searchValue} jobs with a limit of ${options.maxRecords} offers per service.`);
  
  // !The:Protocol scrapping disabled: cloudflare blocks bot on the production(render.com)
  // console.log("⚙️  Scrapping The:Protocol...");
  // const scrappTheProtocol = new ScrapperTheProtocol(options);
  // const theProtocol: Array<JobOffer> = await scrappTheProtocol.getJobs();

  console.log("⚙️  Scrapping NoFluffJobs...");
  const scrappNoFluffJobs = new ScrapperNoFluffJobs(options);
  const noFluffJobs: Array<JobOffer> = await scrappNoFluffJobs.getJobs();

  console.log("⚙️  Scrapping Pracuj.pl...");
  const scrappPracujPl = new ScrapperPracujPl(options);
  const pracujPl: Array<JobOffer> = await scrappPracujPl.getJobs();

  const offers = [...noFluffJobs, ...pracujPl];

  if (false) {
    // disable saving data
    saveJson(offers, options);
    saveCsv(offers, options);
  }

  console.log("✔️  Done!");
  return offers;
};

export default findOffers;
