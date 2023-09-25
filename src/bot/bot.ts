import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
require("dotenv").config();

export default class Bot {
  cluster: Cluster | null = null;

  async initCluster(maxConcurrency: number): Promise<void> {
    puppeteer.use(StealthPlugin());
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: maxConcurrency,
      puppeteerOptions: {
        headless: "new",
        defaultViewport: null,
        executablePath:
        process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    },
    });

    this.cluster.on("taskerror", (error: Error, data: any) => {
      console.error(`Error executing task: ${data}: ${error.message}`);
    });
  }

  async closeCluster(): Promise<void> {
    if (this.cluster) {
      await this.cluster.idle();
      await this.cluster.close();
    }
  }
}
