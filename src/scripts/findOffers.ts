import type { ScrapperOptions, JobOffer } from "../types/main";
import ScrapperNoFluffJobs from "../bot/scrapper/scrapperNoFluffJobs";
import ScrapperTheProtocol from "../bot/scrapper/scrapperTheProtocol";
import ScrapperPracujPl from "../bot/scrapper/scrapperPracujPL";
import saveJson from "./saveJson";
import saveCsv from "./saveCsv";

const findOffers = async (options: ScrapperOptions): Promise<Array<JobOffer>> => {
  console.log(`👓 Searching for ${options.searchValue} jobs with a limit of ${options.maxRecords} offers per service.`);

  let theProtocol: Array<JobOffer> | null = null;

  // !The:Protocol scrapping disabled on production: 
  // ! cloudflare check blocks the bot when app is runnin on render.com
  if (process.env.NODE_ENV != "production") {
    console.log("⚙️  Scrapping The:Protocol...");
    const scrappTheProtocol = new ScrapperTheProtocol(options);
    theProtocol = await scrappTheProtocol.getJobs();
  } else {
    console.log("⚠️  Scrapping The:Protocol disabled on production.");
  }

  console.log("⚙️  Scrapping NoFluffJobs...");
  const scrappNoFluffJobs = new ScrapperNoFluffJobs(options);
  const noFluffJobs: Array<JobOffer> = await scrappNoFluffJobs.getJobs();

  console.log("⚙️  Scrapping Pracuj.pl...");
  const scrappPracujPl = new ScrapperPracujPl(options);
  const pracujPl: Array<JobOffer> = await scrappPracujPl.getJobs();

  const offers = [...(theProtocol || []), ...(noFluffJobs || []), ...(pracujPl || [])];

  if (false) {
    // disable saving data
    saveJson(offers, options);
    saveCsv(offers, options);
  }

  console.log("✔️  Done!");
  return offers;
};

export default findOffers;
