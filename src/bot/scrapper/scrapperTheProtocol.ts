import type { ScrapperOptions, JobOffer } from "../../types/main";
import Bot from "../bot";

export default class ScrapperTheProtocol extends Bot {
  options: ScrapperOptions;
  baseUrl = "https://theprotocol.it/";

  constructor(options: ScrapperOptions) {
    super();
    this.options = options;
  }

  // Main function
  async getJobs(): Promise<Array<JobOffer>> {
    const searchQuery = `${this.options.searchValue.replaceAll(" ", "%20")}`;
    const limit = this.options.maxRecords;
    try {
      await this.initCluster(2); // Set maximum concurrency to 2, setting more than 2 causes errors when scrapping the:protocol
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
      // 25 offers per page on the the:Protocol
      const pages = Math.trunc(limit / 25) + 1;
      const promises = Array.from({ length: pages }, (_, i) =>
        this.cluster.execute(async ({ page }) => {
          await page.goto(`${this.baseUrl}?kw=${searchQuery}&pageNumber=${i + 1}`);
          const urls = await page.$$eval(
            '[data-test="offersList"] [data-test="list-item-offer"]',
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
            await page.goto(url);
            await page.waitForSelector("#offerHeader");

            const offer: JobOffer = await page.evaluate((url: string) => {
              let salaryFrom: string, salaryTo: string, currency: string;
              const title = document.querySelector('[data-test="text-offerTitle"]')?.textContent.trim();

              // Get description from sub subsections
              const aboutProject = document.querySelector('[data-test="section-about-project"]')?.textContent.trim();
              const responsibilities = document
                .querySelector('[data-test="section-responsibilities"]')
                ?.textContent.trim();
              const requirements = document.querySelector('[data-test="section-requirements"]')?.textContent.trim();
              const description = aboutProject + requirements + responsibilities;

              const company = document.querySelector('[data-test="anchor-company-link"]')?.textContent.trim();

              //   Extract salary from the string(eg.: 16 000–18 500 zł)
              const salary = document.querySelector('[data-test="text-contractSalary"]')?.textContent.trim();
              if (salary) {
                if (salary.includes("–")) {
                  const [salaryPart1, salaryPart2] = salary.split("–").map((part) => part.trim());
                  salaryFrom = salaryPart1.trim().replace(" ","");
                  salaryTo = salaryPart2.slice(0, salaryPart2.length - 3).trim().replace(" ","");
                  currency = salaryPart2.slice(salaryPart2.length - 3).trim();
                } else {
                  salaryFrom = salary.slice(0, salary.length - 3).trim().replace(" ","");
                  salaryTo = salaryFrom;
                  currency = salary.slice(salary.length - 3).trim();
                }
              } else {
                salaryFrom = salaryTo = currency = "Not specified";
              }

              // Extract required technologies
              const technologies = Array.from(
                document.querySelectorAll('[data-test="section-technologies"] [data-test="chip-technology"]')
              )?.map((item) => item.textContent.trim().replace("\n", ""));

              // There is no information about posting date
              const addedAt = "Not specified.";

              return {
                title,
                description: description.replaceAll("\n"," "),
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
      console.error("Error scrapping the:protocol offers: ", error);
      throw new Error("An error occurred while scrapping the:protocol offers.");
    } finally {
      return jobOffers;
    }
  }
}
