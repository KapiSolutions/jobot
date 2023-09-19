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
    const limit = this.options.maxRecords; //divide by 2 after creating second scrapper
    try {
      await this.init();
      const jobUrls = await this.getJobsUrls(limit, searchQuery);
      const offers = await this.getJobOffers(jobUrls);
      return offers;
    } catch (error) {
      console.error(error);
    } finally {
      await this.close();
    }
  }

  // Get urls to the offers within provided limit
  async getJobsUrls(limit: number, searchQuery: string): Promise<Array<string>> {
    let jobUrls: Array<string> = [];
    try {
      // 20 offers per page on the noFluffJobs
      const pages = Math.trunc(limit / 20) + 1;
      for (let i = 1; i <= pages; i++) {
        await this._page.goto(`${this.baseUrl}${searchQuery}?page=${i}`);
        const urls = await this._page.$$eval(".list-container a", (elements) =>
          elements.map((element) => element.href).filter((href) => href.includes("/pl/"))
        );
        jobUrls = jobUrls.concat(urls);
      }

      return jobUrls.slice(0, limit);
    } catch (error) {
      console.error("Error extracting job offers urls:", error);
      throw new Error("Error extracting job offers urls:");
    }
  }

  // Scrapp the job offers data within provided jobs number limit
  async getJobOffers(jobUrls: Array<string>): Promise<Array<JobOffer>> {
    const jobOffers: Array<JobOffer> = [];
    for (const url of jobUrls) {
        try {
          // Create a new Page instance for each job offer
          const page = await this._browser.newPage();
          await page.goto(url);
          await page.waitForSelector("article");

          const offer = await page.evaluate((url) => {
            let salaryFrom: string, salaryTo: string, currency: string, addedAt: string;

            const title = document.querySelector("article h1").textContent.trim();
            const jobDescription = document.querySelector("#posting-description nfj-read-more")?.textContent.trim();
            const requirements = document
              .querySelector('[data-cy-section="JobOffer_Requirements"]')
              ?.textContent.trim();
            const description = jobDescription ? jobDescription : requirements;
            const company = document.querySelector("#postingCompanyUrl").textContent.trim();

            // Extract salary from the string(eg.: 12 000 – 18 000 PLN)
            const salary = document.querySelector(".salary h4").textContent.trim();
            if (salary.includes("–")) {
              const [salaryPart1, salaryPart2] = salary.split("–").map((part) => part.trim());
              salaryFrom = salaryPart1.trim();
              salaryTo = salaryPart2.slice(0, salaryPart2.length - 3).trim();
              currency = salaryPart2.slice(salaryPart2.length - 3);
            } else {
              salaryFrom = salary.slice(0, salary.length - 3).trim();
              salaryTo = salaryFrom;
              currency = salary.slice(salary.length - 3);
            }
            // Extract required technologies
            const technologies = Array.from(document.querySelectorAll("#posting-requirements li")).map((item) =>
              item.textContent.trim().replace("\n", "")
            );
            // Extract the job posting date
            const postingMsg = document.querySelector(".posting-time-row").textContent.trim();
            const numberFound = postingMsg.match(/\d+/);
            if (numberFound) {
              const today = new Date();
              today.setDate(today.getDate() - parseInt(numberFound[0]));
              addedAt = today.toDateString();
            } else {
              addedAt = new Date().toDateString();
            }

            return {
              title,
              description,
              company,
              salaryFrom,
              salaryTo,
              currency,
              offerURL: url,
              technologies,
              addedAt,
            };
          }, url);

          // Close the Page instance after navigation
          await page.close();
          jobOffers.push(offer);
        } catch (error) {
          console.error("Error scrapping noFluffJobs offers: ", error);
          throw new Error("An error occurred while scrapping noFluffJobs offers.");
        }
      }
    return jobOffers;
  }

}
