import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";
import { DELAY_DURATION } from "../helpers/constants.js";

workPerCsvRow("../data/report-230222-1677111566139.csv", rowToFAQGroup);

async function rowToFAQGroup({ "Directory URL": url }) {
  await delay(DELAY_DURATION);

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
