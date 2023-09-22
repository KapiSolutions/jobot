import input from "@inquirer/input";
import { program } from "commander";

// Get scrapper options from the console input
const getOptions = async () => {
  const mode = true;
  // mode true: get options directly from the script command eg: npm run scrap:offers -- -s html -l 10,
  // mode false: get options from the user console input during script execution
  
  if (mode) {
    program
      .description("Scrape offers from two services")
      .requiredOption("-s, --searchValue <query>", "Search query for scrapping jobs", "javascript")
      .requiredOption("-l, --maxRecords <number>", "Limit the number of jobs per service", parseInt, 4)
      .parse(process.argv);
    const options = program.opts();
    // Validate maxRecords: should be at least 1
    const maxRecords = Math.max(1, options.maxRecords);
    return { searchValue: options.searchValue, maxRecords: maxRecords };
  } else {
    const searchValue: string = await input({
      message: "Please enter the search value for the job:",
      validate: (input) => {
        if (input !== "") {
          return true;
        }
        return "This field is required.";
      },
    });
    const maxRecords: string = await input({
      message: "Limit the number of jobs per service: ",
      validate: (input) => {
        const number = parseInt(input);
        if (!isNaN(number) && number > 0) {
          return true;
        }
        return "Please enter a positive number.";
      },
    });
    return { searchValue: searchValue, maxRecords: parseInt(maxRecords) };
  }
};

export default getOptions;
