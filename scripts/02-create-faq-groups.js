import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";

workPerCsvRow("../data/report-230222-1677111566139.csv", rowToFAQGroup);

async function rowToFAQGroup({ "Directory URL": url }) {
  // const cleanUrl = extractUrl(url);
  // const params = cleanUrl.replace("https://www.expertise.com/", "").split("/");
  // if (params.some((v) => !v)) {
  // console.log("Error splitting url");
  // return;
  // }
  // const slug = `${params[0]}/${params[1]}/${params[2]}`;

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
