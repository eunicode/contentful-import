import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import contentful from "contentful-management";
import fs from "fs";
// import { parse as Parser } from "csv-parse";
import { parse } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream";
import { parseISO } from "date-fns";
import moment from "moment";

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
  to: 1,
});

// Convert CSV to JSON
const readableStream = fs.createReadStream(csvPath).pipe(parser);

for await (const chunk of readableStream) {
  // console.log(chunk);
  const entry = await rowToEntry(chunk);
  console.log(entry);
  // entry.publish();
}

function extractUrl(html) {
  let url = html.replaceAll(/<[^>]*>/g, "");
  if (url.startsWith("https://www.expertise.com/")) {
    return url;
  } else {
    console.log("Error extracting url");
  }
}

function formatDate(string) {
  // Contenful format: { 'en-US': '2023-02-23T00:00-08:00' }
  // SF format: 2/12/2023 10:16 PM // What timezone?
  return moment(string, "M-D-YYYY LT").format();
}

function wrapInLocaleObj(value) {
  return { "en-US": value };
}

async function rowToEntry_FAQ({
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
  const FAQs = [
    { q: Q1v, a: A1v, type: "vertical", num: 1 },
    { q: Q2v, a: A2v, type: "vertical", num: 2 },
    { q: Q1c, a: A1c, type: "content", num: 1 },
    { q: Q2c, a: A2c, type: "content", num: 2 },
    { q: Q3c, a: A3c, type: "content", num: 3 },
    { q: Q4c, a: A4c, type: "content", num: 4 },
    { q: Q5c, a: A5c, type: "content", num: 5 },
  ];

  for (const { q, a, type, num } of FAQs) {
    const generatedId = `${id}_${type}_${num}`;

    scopedPlainClient.entry.create(
      { contentTypeId: "faq" },
      {
        fields: {
          question: wrapInLocaleObj(q),
          answer: wrapInLocaleObj(a),
          directoryUrl: wrapInLocaleObj(extractUrl(url)),
          idBasedOnSf: wrapInLocaleObj(generatedId),
          last_modified: wrapInLocaleObj(formatDate(lastMod)),
        },
      }
    );
  }
}

/* 

*/
