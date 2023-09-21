import getOptions from "./getOptions";
import type { ScrapperOptions, JobOffer } from "../types/main";
import ScrapperNoFluffJobs from "../bot/scrapper/scrapperNoFluffJobs";
import ScrapperTheProtocol from "../bot/scrapper/scrapperTheProtocol";
import saveJson from "./saveJson";

const findOffers = async (): Promise<void> => {
  const options: ScrapperOptions = await getOptions();
  console.log(`Searching for ${options.searchValue} jobs with a limit of ${options.maxRecords} offers.`);

  const scrappNoFluffJobs = new ScrapperNoFluffJobs(options);
  const noFluffJobs: Array<JobOffer> = await scrappNoFluffJobs.getJobs();

  const scrappTheProtocol = new ScrapperTheProtocol(options);
  const theProtocol: Array<JobOffer> = await scrappTheProtocol.getJobs();

  const offers = [...noFluffJobs, ...theProtocol];
  saveJson(offers, options);
};

findOffers();
