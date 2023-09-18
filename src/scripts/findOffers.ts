import Bot from "../bot/bot";
import getOptions from "./getOptions";
import type { ScrapperOptions } from "../types/main";

const findOffers = async () => {
  const options: ScrapperOptions = await getOptions();
  console.log("Scrapping...");

// Bot test
  const bot = new Bot();
  await bot.init();
  const title = await bot.getTitle(`https://rocketjobs.pl/?keyword=${options.searchValue}`);
  console.log("title: ", title);
  await bot.close();
};

findOffers();
