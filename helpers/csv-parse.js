import fs from "fs";
import { parse } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";

const createFilePath = (filepath) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename); // returns /Users/someuser/contentful-import/scripts
  const csvPath = path.join(__dirname, filepath);
  return csvPath;
};

const createCsvStream = (filepath) => {
  // Instantiate csv parser
  const parser = parse({
    delimiter: ",",
    columns: true,
    to: 1,
  });

  const csvPath = createFilePath(filepath);

  // Convert csv stream to json stream
  return fs.createReadStream(csvPath).pipe(parser);
};

export const workPerCsvRow = async (filepath, callback) => {
  const csvStream = createCsvStream(filepath);

  for await (const chunk of csvStream) {
    await callback(chunk);
  }
};

export default workPerCsvRow;

/* 
With Node 16.12.0+ you can use top-level await
*/
