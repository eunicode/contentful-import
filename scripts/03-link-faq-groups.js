import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";

// workPerCsvRow("../data/report-230222-1677111566139.csv", linkFAQsToGroup);

const faqsGroupedByUrl = [];

const relatedFAQs = await cmaClient.entry.getMany({
  query: {
    // skip: 100,
    limit: 10,
    content_type: "faq",
    // fields.directoryUrl: 'https://www.expertise.com/ca/hayward/motorcycle-accident-lawyer'
  },
});

for (const faq of relatedFAQs.items) {
  console.log(faq.fields.directoryUrl);
}

async function linkFAQsToGroup({ "Directory URL": url }) {
  //

  await delay(0.3);
  let entry = await cmaClient.entry.create(
    { contentTypeId: "faqDirectoryGroup" },
    {
      fields: {
        directoryUrl: wrapInLocaleObj(extractUrl(url)),
      },
    }
  );

  await cmaClient.entry.publish({ entryId: entry.sys.id }, entry);
}
