import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import locateChrome from "locate-chrome";
require("dotenv").config();

export default class Bot {
  cluster: Cluster | null = null;

  async initCluster(maxConcurrency: number): Promise<void> {
    puppeteer.use(StealthPlugin());
    const executablePath: string =
      (await new Promise((resolve) => locateChrome((arg: any) => resolve(arg)))) ||
      process.env.PUPPETEER_EXECUTABLE_PATH;
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: maxConcurrency,
      puppeteerOptions: {
        headless: "new",
        defaultViewport: null,
        executablePath: process.env.NODE_ENV === "production" ? executablePath : puppeteer.executablePath(),
        args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
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
