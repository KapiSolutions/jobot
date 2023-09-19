import puppeteer, { Browser, Page } from "puppeteer";

export default class Bot {
  _browser: Browser | null = null;
  _page: Page | null = null;

  // Initialize the scrapper Bot
  async init(): Promise<void> {
    this._browser = await puppeteer.launch({ headless: false, defaultViewport: null }); //launch in the desktop mode
    this._page = await this._browser.newPage();
  }

  // Close the browser, kill the Bot
  async close(): Promise<void> {
    if (this._browser) {
      await this._browser.close();
    }
  }
}
