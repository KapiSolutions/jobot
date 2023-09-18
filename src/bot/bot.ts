import puppeteer, { Browser, Page } from "puppeteer";

export default class Bot {
  _browser: Browser | null = null;
  _page: Page | null = null;

// Initialize the scrapper Bot
  async init(): Promise<void> {
    this._browser = await puppeteer.launch({ headless: false });
    this._page = await this._browser.newPage();
  }

// test: get page title
  async getTitle(url: string): Promise<string> {
    if (!this._page) {
			throw new Error('Page has not been initialized. Call init() method first.');
		}
		try {
			await this._page.goto(url)
		} catch (error) {
			console.error('Navigation error: ', error)
			throw new Error('An error occurred while navigating to the page.')
		}
    const title = await this._page.evaluate(() => document.title);
    return title;
  }

// Close the browser
  async close(): Promise<void> {
    if (this._browser) {
      await this._browser.close();
    }
  }
}
