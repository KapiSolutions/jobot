import fs from "fs";
import path from "path";
import type { JobOffer, ScrapperOptions } from "../types/main";

const saveCsv = (data: Array<JobOffer>, options: ScrapperOptions) => {
  // Extract the header row from the first object's keys
  const header = Object.keys(data[0]);

  // Extract data rows
  const dataRows = data.map((obj: JobOffer) =>
    header.map((key) => (Array.isArray(obj[key]) ? obj[key].join(" ") : obj[key]))
  );

  // Combine the header and data rows
  const csv = [header.join("|"), ...dataRows.map((row) => row.join("|"))].join("\n");

  // Create path and filename
  const scrappDate = new Date().toLocaleDateString("pl-PL");
  const absolutePath = path.resolve(__dirname, "../../scrap-results/");
  const filePath = `${absolutePath}/${options.searchValue}-${options.maxRecords * 2}-offers_${scrappDate}.csv`;

  // Write the CSV data to the file
  fs.writeFile(filePath, csv, "utf8", (err) => {
    if (err) {
      console.error("Error writing CSV file:", err);
    } else {
      console.log("Data has been saved to", filePath);
    }
  });
};
export default saveCsv;
