import { Cluster } from "puppeteer-cluster";

export default class Bot {
  cluster: Cluster | null = null;

  async initCluster(maxConcurrency: number): Promise<void> {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: maxConcurrency,
      puppeteerOptions: {
        headless: "new",
        defaultViewport: null,
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
