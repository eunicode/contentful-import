import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import contentful from "contentful-management";
import fs from "fs";
// import { parse as Parser } from "csv-parse";
import { parse } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream";

dotenv.config();

// Look at PlainClientAPI type for hints

// With scoped space and environment
const scopedPlainClient = contentful.createClient(
  {
    // This is the access token for this space. Normally you get the token in the Contentful web app
    accessToken: process.env.PERSONAL_TOKEN,
  },
  {
    type: "plain",
    defaults: {
      spaceId: process.env.SPACE_ID,
      environmentId: process.env.ENVIRONMENT_ID,
    },
  }
);

// If you use Node.js version 16.12.0 or more recent, you can use top-level await
// entries from '<space_id>' & '<environment_id>'
// const entries = await scopedPlainClient.entry.getMany({
//   query: {
//     skip: 5,
//     limit: 10,
//   },
// });

// console.log(entries.items);

const singleEntry = await scopedPlainClient.entry.get({
  entryId: "5jPdhXqQpHPGPsxAdV55Is",
});

console.log(singleEntry);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// returns /Users/someuser/contentful-import/scripts

// ARGUMENT: CHANGE FILE PATH
const csvPath = path.join(__dirname, "../data/report-230222-1677111566139.csv");

// Convert CSV to JSON
// const parser = new Parser({ delimiter: ",", columns: true });

// Initialize the csv parser
const parser = parse({
  delimiter: ",",
  columns: true,
  relax_quotes: true,
  to: 1,
});

// const readableStream = fs
//   .createReadStream(csvPath)
//   .on("error", () => console.log("error with file path"))
//   .pipe(parser);

// Use stream to consume chunks
const csvStream = pipeline(fs.createReadStream(csvPath), parser, (err) => {
  if (err) {
    console.error("Pipeline failed", err);
  } else {
    console.log("Pipeline succeeded");
  }
});

async function chunkWork(readable) {
  for await (const chunk of readable) {
    //  rowToEntry()
    console.log({
      row: chunk.Name,
    });
  }
}

// chunkWork(csvStream);
// undefined gets logged, then 'Pipeline succeeded'
for await (const chunk of csvStream) {
  console.log(chunk.Name);
  // const entry = await rowToEntry(chunk);
  // console.log(entry);
  // entry.publish();
}

async function rowToEntry(row) {
  scopedPlainClient.entry.create(
    { contentTypeId: "faq" },
    {
      fields: {
        id: { "en-US": 999999 },
        answer: {
          "en-US": "This is an answer",
        },
        question: {
          "en-US": "This is a question",
        },
      },
    }
  );
}

/* 

*/
