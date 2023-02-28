import cmaClient from "../helpers/client.js";
import {
  extractUrl,
  formatDate,
  wrapInLocaleObj,
  delay,
} from "../helpers/helpers.js";
import { DELAY_DURATION } from "../helpers/constants.js";

import workPerCsvRow from "../helpers/csv-parse.js";

workPerCsvRow("../data/report-230222-1677111566139.csv", rowToFAQ);

async function rowToFAQ({
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

    await delay(DELAY_DURATION); // rate limit

    let currEntry = await cmaClient.entry.create(
      { contentTypeId: "faq" },
      {
        fields: {
          question: wrapInLocaleObj(q),
          answer: wrapInLocaleObj(a),
          directoryUrl: wrapInLocaleObj(extractUrl(url)),
          idBasedOnSf: wrapInLocaleObj(generatedId),
          last_modified: wrapInLocaleObj(formatDate(lastMod)),
          type: wrapInLocaleObj("directory"),
        },
      }
    );

    await cmaClient.entry.publish({ entryId: currEntry.sys.id }, currEntry);
  }
}

/* 
https://stackoverflow.com/questions/68989337/how-to-use-contentful-management-to-add-an-asset-to-an-entry-in-one-api-call

https://stackoverflow.com/questions/70115821/contentful-create-and-publish-in-single-request

'X-Contentful-Version': rawData.sys.version
                                      ^
TypeError: Cannot read properties of undefined (reading 'sys')
    at publish


https://contentful.github.io/contentful-management.js/contentful-management/5.11.3/create-environment-api.js.html#line308

updateEnvironment()
raw = this.toPlainObject()

Update w/ plain API
https://github.com/contentful/contentful-management.js/issues/1461

since you are using the PlainClient api, you need to pass the version (which is the current entry version you want to update) propert

https://github.com/contentful/contentful-management.js/blob/9655c6ebca0918cf6a0db512059840483da524bd/lib/adapters/REST/endpoints/entry.ts#L48

Update fail
https://github.com/contentful/contentful-management.js/issues/213
no version header 

VERSION
Update = entry version bump
Every time you make an edit, the version gets bumped
Publish = entry version bump
*/
