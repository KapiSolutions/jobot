import getOptions from "./getOptions";
import type { ScrapperOptions, JobOffer } from "../types/main";
import ScrapperNoFluffJobs from "../bot/scrapper/scrapperNoFluffJobs";

const findOffers = async () => {
  const options: ScrapperOptions = await getOptions();
  console.log(`Searching for ${options.searchValue} jobs with a limit of ${options.maxRecords} offers.`);

  const scrapNoFluffJobs = new ScrapperNoFluffJobs(options);
  const noFluffJobs: Array<JobOffer> = await scrapNoFluffJobs.getJobs();
  console.log(noFluffJobs);
};

findOffers();
