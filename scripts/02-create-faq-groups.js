import cmaClient from "../helpers/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // returns /Users/someuser/contentful-import/scripts
const csvPath = path.join(__dirname, "../data/report-230222-1677111566139.csv");

// Initialize the csv parser
const parser = parse({
  delimiter: ",",
  columns: true,
  to: 1,
});

// Convert CSV to JSON stream
const readableStream = fs.createReadStream(csvPath).pipe(parser);

// With Node 16.12.0+ you can use top-level await
for await (const chunk of readableStream) {
  const entry = await rowToEntry_Group(chunk);
  // entry.publish();
}

async function rowToEntry_Group({ "Directory URL": url }) {
  await delay(0.5); // rate limit

  cmaClient.entry.create(
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
