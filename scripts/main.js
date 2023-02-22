import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import contentful from "contentful-management";
import fs from "fs";
import { parse as Parser } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";

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

// entries from '<space_id>' & '<environment_id>'
const entries = await scopedPlainClient.entry.getMany({
  query: {
    skip: 5,
    limit: 10,
  },
});

// console.log(entries.items);

const singleEntry = await scopedPlainClient.entry.get({
  entryId: "19",
});

// console.log(singleEntry);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // /Users/someuser/contentful-import/scripts
const csvPath = path.join(__dirname, "../data/sample-faq.csv");

const parser = new Parser({ delimiter: ",", columns: true });
const readStream = fs.createReadStream(csvPath).pipe(parser);
rowToEntry("nothing");
// for await (const chunk of readStream) {
//   // console.log(chunk);
//   const entry = await rowToEntry(chunk);
//   console.log(entry);
//   entry.publish();
// }

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
