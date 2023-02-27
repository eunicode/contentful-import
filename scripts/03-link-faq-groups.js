import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";
import { DELAY_DURATION } from "../helpers/constants.js";

const urlGroupIdMap = await createFaqGroupMap();

iterateFaqs();

async function iterateFaqs() {
  // let relatedFaqsTemp = [];
  // let relatedFaqsCount = 0;

  let faqs = faqSearch("faq", 10);

  for await (const faq of faqs) {
    // console.log(faq);
    if (!faq.fields.directoryUrl) {
      break;
    }

    let faqUrl = faq.fields.directoryUrl["en-US"];
    let faqGroupId = urlGroupIdMap.get(faqUrl).id;
    let faqGroup = await cmaClient.entry.get({ entryId: faqGroupId });

    // let faqUrl = faq.fields.directoryUrl["en-US"];
    // let faqGroupId = urlGroupIdMap.get(faqUrl).id;
    // let faqGroupVersion = urlGroupIdMap.get(faqUrl).version;
    // let faqGroupSys = (await cmaClient.entry.get({ entryId: faqGroupId })).sys;

    await delay(DELAY_DURATION);

    await cmaClient.entry.update(
      { entryId: faqGroupId },
      {
        sys: faqGroup.sys,
        fields: {
          ...faqGroup.fields,
          relatedFaQs: {
            "en-US": [
              ...faqGroup.fields.relatedFaQs,
              {
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: faq.sys.id,
                },
              },
            ],
          },
        },
      }
    );
  }
}

function faqSearch(type, size) {
  function faqSearchPagination(type, cursor) {
    return cmaClient.entry.getMany({
      query: {
        skip: cursor,
        limit: size,
        order: "-sys.createdAt",
        content_type: type,
        "fields.directoryUrl":
          "https://www.expertise.com/ca/hayward/motorcycle-accident-lawyer",
      },
    });
  }
  // Iterable object
  return {
    // Iterator function, returns iterator object
    [Symbol.asyncIterator]: async function* () {
      let cursor = 0;

      while (cursor < 50) {
        // while (true) {
        const dataSlice = await faqSearchPagination(type, cursor);

        for (const [idx, item] of dataSlice.items.entries()) {
          if (idx === 0) {
            yield item;
          }
          // yield item;
        }

        cursor = cursor + size;
      }
    },
  };
}

// Create a map to map directory URL to faqDirectoryGroup entry id
async function createFaqGroupMap() {
  const urlGroupIdMap = new Map();

  // Todo: create and use pagination generator
  const faqGroupList = await cmaClient.entry.getMany({
    query: {
      content_type: "faqDirectoryGroup",
    },
  });

  for (const faqGroup of faqGroupList.items) {
    urlGroupIdMap.set(faqGroup.fields.directoryUrl["en-US"], {
      id: faqGroup.sys.id,
      version: faqGroup.sys.version,
    });
  }

  return urlGroupIdMap;
}

// let x = await cmaClient.entry.get({ entryId: "6j4puCWxawaaDmoTPABDgE" });
// console.log(x.sys.version);

// let y = await cmaClient.entry.update(
//   { entryId: "6j4puCWxawaaDmoTPABDgE" },
//   {
//     sys: x.sys,
//     fields: {
//       ...x.fields,
//       relatedFaQs: {
//         "en-US": [
//           {
//             sys: {
//               type: "Link",
//               linkType: "Entry",
//               id: "3KZuM3kxFZ7u9Luxq6f7oP",
//             },
//           },
//         ],
//       },
//     },
//   }
// );

// await cmaClient.entry.publish({ entryId: "6j4puCWxawaaDmoTPABDgE" }, y);

/* 
'X-Contentful-Version': (_rawData$sys$version = rawData.sys.version) !== null && _rawData$sys$version !== void 0 ? _rawData$sys$version : 0

https://github.com/contentful/contentful-management.js/issues/1461

  since you are using the PlainClient api, you need to pass the version (which is the current entry version you want to update) property as well when you are calling this function.

 filter getMany() 
 https://github.com/contentful/contentful-management.js/issues/1690

 'fields.name': 'Universal Studios'

 getMany()
 {
   items: [{fields: {question: {}, answer: {}, directoryUrl: {'en-US': string}}}]
}

Newest first
 order: "-sys.createdAt",

 https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits
 By default the Contentful Management API enforces rate limits of 7 requests per second. 
 Higher rate limits may apply depending on your current plan.

https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/updating-and-version-locking
When updating an existing resource, you need to specify its current version 

Technical limits
https://www.contentful.com/developers/docs/technical-limits/#free-plan

Free: 
1 req = 144 ms  

Basic:
1 req = 100 ms

 */
