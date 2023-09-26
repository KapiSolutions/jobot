import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
require("dotenv").config();

export default class Bot {
  cluster: Cluster | null = null;
  timeout = { timeout: 60000 };

  async initCluster(maxConcurrency: number): Promise<void> {
    puppeteer.use(StealthPlugin());
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: maxConcurrency,
      timeout: 60000,
      retryLimit: 1,
      puppeteerOptions: {
        headless: "new",
        defaultViewport: { width: 1280, height: 800 },
        executablePath:
          process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
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
