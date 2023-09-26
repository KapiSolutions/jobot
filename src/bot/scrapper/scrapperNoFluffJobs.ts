import type { ScrapperOptions, JobOffer } from "../../types/main";
import Bot from "../bot";

export default class ScrapperNoFluffJobs extends Bot {
  options: ScrapperOptions;
  baseUrl = "https://nofluffjobs.com/pl/";

  constructor(options: ScrapperOptions) {
    super();
    this.options = options;
  }

  // Main function
  async getJobs(): Promise<Array<JobOffer>> {
    const searchQuery = `${this.options.searchValue.replaceAll(" ", "%20")}`;
    const limit = this.options.maxRecords;
    try {
      await this.initCluster(3); // Set maximum concurrency to 3
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
      // 20 offers per page on the noFluffJobs
      const pages = Math.trunc(limit / 20) + 1;
      const promises = Array.from({ length: pages }, (_, i) =>
        this.cluster.execute(async ({ page }) => {
          await page.goto(`${this.baseUrl}${searchQuery}?page=${i + 1}`, this.timeout);
          const urls = await page.$$eval(".list-container a", (elements: Array<HTMLAnchorElement>) =>
            elements.map((element: HTMLAnchorElement) => element.href).filter((href: string) => href.includes("/pl/"))
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
          this.cluster.execute(async ({ page }): Promise<void> => {
            await page.goto(url, this.timeout);
            await page.waitForSelector("article");
            const offer: JobOffer = await page.evaluate((url: string) => {
              let salaryFrom: string, salaryTo: string, currency: string, addedAt: string;

              const title = document.querySelector("article h1")?.textContent.trim();
              const jobDescription = document.querySelector("#posting-description nfj-read-more")?.textContent.trim();
              const requirements = document
                .querySelector('[data-cy-section="JobOffer_Requirements"]')
                ?.textContent.trim();
              const description = jobDescription ? jobDescription : requirements;
              const company = document.querySelector("#postingCompanyUrl")?.textContent.trim();

              // Extract salary from the string(eg.: 12 000 – 18 000 PLN)
              const salary = document.querySelector(".salary h4")?.textContent.trim();
              if (salary) {
                if (salary.includes("–")) {
                  const [salaryPart1, salaryPart2] = salary?.split("–").map((part) => part.trim());
                  salaryFrom = salaryPart1.trim().replace(" ", "");
                  salaryTo = salaryPart2
                    .slice(0, salaryPart2.length - 3)
                    .trim()
                    .replace(" ", "");
                  currency = salaryPart2.slice(salaryPart2.length - 3);
                } else {
                  salaryFrom = salary
                    .slice(0, salary.length - 3)
                    .trim()
                    .replace(" ", "");
                  salaryTo = salaryFrom;
                  currency = salary.slice(salary.length - 3);
                }
              }

              // Extract required technologies
              const technologies = Array.from(document.querySelectorAll("#posting-requirements li")).map((item) =>
                item.textContent.trim().replace("\n", "")
              );
              // Extract the job posting date
              const postingMsg = document.querySelector(".posting-time-row")?.textContent.trim();
              const numberFound = postingMsg?.match(/\d+/);
              if (numberFound) {
                const today = new Date();
                today.setDate(today.getDate() - parseInt(numberFound[0]));
                addedAt = today.toDateString();
              } else {
                addedAt = new Date().toDateString();
              }

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
      return jobOffers;
    } catch (error) {
      console.error("Error scrapping noFluffJobs offers: ", error);
      throw new Error("An error occurred while scrapping noFluffJobs offers.");
    }
  }
}
