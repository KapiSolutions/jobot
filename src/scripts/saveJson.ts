import fs from "fs";
import path from 'path';
import { ScrapperOptions } from "../types/main";

const saveJson = (data: Object, options: ScrapperOptions) => {
  // Convert the data to a JSON string
  const jsonData = JSON.stringify(data, null, 2); 
  const scrappDate = new Date().toLocaleDateString("pl-PL");
  const absolutePath = path.resolve(__dirname, '../../scrap-results/');
  const filePath = `${absolutePath}/${options.searchValue}-${options.maxRecords*2}-offers_${scrappDate}.json`;
  // Write the JSON data to the file
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("Data has been saved to", filePath);
    }
  });
};
export default saveJson;
