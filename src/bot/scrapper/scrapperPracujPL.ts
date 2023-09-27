import type { ScrapperOptions, JobOffer } from "../../types/main";
import Bot from "../bot";

export default class ScrapperPracujPl extends Bot {
  options: ScrapperOptions;
  baseUrl = "https://it.pracuj.pl/";

  constructor(options: ScrapperOptions) {
    super();
    this.options = options;
  }

  // Main function
  async getJobs(): Promise<Array<JobOffer>> {
    const searchQuery = `${this.options.searchValue.replaceAll(" ", "%20")}`;
    const limit = this.options.maxRecords;
    try {
      await this.initCluster(3);
      const jobUrls = await this.getJobsUrls(limit, searchQuery);
      const offers = await this.getJobOffers(jobUrls);
      return offers;
    } catch (error) {
      console.error(error);
    } finally {
      await this.closeCluster();
    }
  }

  // Get urls to the offers within provided limit
  async getJobsUrls(limit: number, searchQuery: string): Promise<Array<string>> {
    let jobUrls: Array<string> = [];
    try {
      // 44 offers per page on the pracuj.pl
      const pages = Math.trunc(limit / 44) + 1;
      const promises = Array.from({ length: pages }, (_, i) =>
        this.cluster.execute(async ({ page }) => {
          await page.goto(`${this.baseUrl}praca/${searchQuery};kw?pn=${i + 1}`, this.timeout);
          await page.waitForSelector('[data-test="section-offers"]');
          const urls = await page.$$eval(
            '[data-test="section-offers"] [data-test="link-offer"]',
            (elements: Array<HTMLAnchorElement>) => elements.map((element: HTMLAnchorElement) => element.href)
          );
          jobUrls = jobUrls.concat(urls);
        })
      );
      await Promise.all(promises);
      return jobUrls.slice(0, limit);
    } catch (error) {
      console.error("Error extracting job offers urls:", error);
      throw new Error("Error extracting job offers urls:");
    }
  }

  // Scrapp the job offers data within provided jobs number limit
  async getJobOffers(jobUrls: Array<string>): Promise<Array<JobOffer>> {
    const jobOffers: Array<JobOffer> = [];
    try {
      await Promise.all(
        jobUrls.map((url: string) =>
          this.cluster?.execute(async ({ page }): Promise<void> => {
            await page.goto(url, this.timeout);
            await page.waitForSelector("#kansas-offerview");

            const offer: JobOffer = await page.evaluate((url: string) => {
              let salaryFrom: string, salaryTo: string, currency: string;
              const title = document.querySelector('[data-test="text-positionName"]')?.textContent.trim();

              // Get description from sub subsections
              const aboutProject = document.querySelector('[data-test="text-about-project"]')?.textContent.trim();
              const responsibilities = document
                .querySelector('[data-test="section-responsibilities"]')
                ?.textContent.trim();
              const requirements = document.querySelector('[data-test="section-requirements"]')?.textContent.trim();
              const description = aboutProject + requirements + responsibilities;

              const company = document.querySelector('[data-test="text-employerName"]')?.textContent.trim();

              //   Extract salary from the string(eg.: 16 000–18 500 zł)
              const salary = document.querySelector('[data-test="section-salary"]');
              if (salary) {
                salaryFrom = document
                  .querySelector('[data-test="section-salary"] [data-test="text-earningAmountValueFrom"]')
                  ?.textContent.trim()
                  .replace(/[ –]/g, "");

                const salaryToTmp = document
                  .querySelector('[data-test="section-salary"] [data-test="text-earningAmountValueTo"]')
                  ?.textContent.trim();

                salaryTo = salaryToTmp
                  ?.slice(0, salaryToTmp.length - 3)
                  .trim()
                  .replace(" ", "");
                currency = salaryToTmp?.slice(salaryToTmp.length - 3).trim();
              } else {
                salaryFrom = salaryTo = currency = "Not specified";
              }

              // Extract required technologies
              const technologies = Array.from(
                document.querySelectorAll('[data-test="section-technologies-expected"] [data-test="item-technology"]')
              )?.map((item) => item.textContent.trim().replace("\n", ""));

              // There is no information about posting date
              const addedAt = "Not specified.";

              return {
                title,
                description: description.replaceAll("\n", " "),
                company,
                salaryFrom,
                salaryTo,
                currency,
                offerURL: url,
                technologies,
                addedAt,
              };
            }, url);

            jobOffers.push(offer);
          })
        )
      );
    } catch (error) {
      console.error("Error scrapping pracuj.pl offers: ", error);
      throw new Error("An error occurred while scrapping pracuj.pl offers.");
    } finally {
      return jobOffers;
    }
  }
}
