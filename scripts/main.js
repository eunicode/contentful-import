import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import contentful from "contentful-management";
import fs from "fs";
// import { parse as Parser } from "csv-parse";
import { parse } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream";

dotenv.config();

// With scoped space and environment
const scopedPlainClient = contentful.createClient(
  {
    // This is the access token for this space. Can get the token in the Contentful web app
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // returns /Users/someuser/contentful-import/scripts

// ARGUMENT: CHANGE FILE PATH
const csvPath = path.join(__dirname, "../data/report-230222-1677111566139.csv");
// const csvPath = path.join(__dirname, "../data/sample-faq.csv");

// Initialize the csv parser
const parser = parse({
  delimiter: ",",
  columns: true,
  relax_quotes: true,
});

// Convert CSV to JSON
const readableStream = fs.createReadStream(csvPath).pipe(parser);

for await (const chunk of readableStream) {
  const entry = await rowToEntry(chunk);
  console.log(entry);
  // entry.publish();
}

function extractUrl(html) {
  let url = html.replaceAll(/<[^>]*>/, "");
  if (url.startsWith("https://www.expertise.com/")) {
    return url;
  } else {
    console.log("Error extracting url");
  }
}

async function rowToEntry({
  "Snippet ID": id,
  "Directory URL": url,
  "Standard Vertical Q1": Q1v,
  "Vertical Answer 1 - Content": A1v,
  "Standard Vertical Q2": Q2v,
  "Vertical Answer 2 - Content": A2v,
  "Question 1- Content": Q1c,
  "Answer  1 - Content": A1c,
  "Question 2 - Content": Q2c,
  "Answer  2 - Content": A2c,
  "Question 3 - Content": Q3c,
  "Answer  3 - Content": A3c,
  "Question 4 - Content": Q4c,
  "Answer  4 - Content": A4c,
  "Question 5 - Content": Q5c,
  "Answer  5 - Content": A5c,
  "Last Modified DT": lastMod,
}) {
  console.log(A2v);

  // scopedPlainClient.entry.create(
  //   { contentTypeId: "faq" },
  //   {
  //     fields: {
  //       id: { "en-US": 999999 },
  //       answer: {
  //         "en-US": "This is an answer",
  //       },
  //       question: {
  //         "en-US": "This is a question",
  //       },
  //     },
  //   }
  // );
}

/* 

*/
