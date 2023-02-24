import cmaClient from "../helpers/client.js";
import {
  extractUrl,
  formatDate,
  wrapInLocaleObj,
  delay,
} from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";

workPerCsvRow("../data/report-230222-1677111566139.csv", rowToFAQGroup);

async function rowToFAQGroup({ "Directory URL": url }) {
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

    await delay(0.3); // rate limit

    let entry = await cmaClient.entry.create(
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

    await cmaClient.entry.publish({ entryId: entry.sys.id }, entry);
  }
}
