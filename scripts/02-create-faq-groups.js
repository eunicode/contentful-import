import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";
import { DELAY_DURATION } from "../helpers/constants.js";

workPerCsvRow("../data/report-230222-1677111566139.csv", rowToFAQGroup);

async function rowToFAQGroup({ "Directory URL": url }) {
  let cleanUrl = extractUrl(url);

  await delay(DELAY_DURATION);

  let newEntry = await cmaClient.entry.create(
    { contentTypeId: "faqDirectoryGroup" },
    {
      fields: {
        directoryUrl: wrapInLocaleObj(cleanUrl),
      },
    }
  );

  await cmaClient.entry.publish({ entryId: newEntry.sys.id }, newEntry);
}

// Check if entry exists
// Restart adding entries after the last successfully created entry
// We don't have id of entry draft (unsuccessful publish bc of error)
