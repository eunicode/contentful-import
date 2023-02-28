import cmaClient from "../helpers/client.js";
import { delay } from "../helpers/helpers.js";
import { DELAY_DURATION } from "../helpers/constants.js";

iterateFaqs();

async function iterateFaqs() {
  let faqs = faqSearch("faq", 500);
  const urlGroupIdMap = await createFaqGroupMap();

  for await (const faq of faqs) {
    if (!faq.fields.directoryUrl) {
      break;
    }

    let faqUrl = faq.fields.directoryUrl["en-US"];

    try {
      let faqGroupId = urlGroupIdMap.get(faqUrl);

      let faqGroup = await cmaClient.entry.get({ entryId: faqGroupId });
      // Create unique faqs list
      let faqLinks = linksAccumulator(faqGroup, faq);

      await delay(DELAY_DURATION);

      let updatedEntry = await cmaClient.entry.update(
        { entryId: faqGroupId },
        {
          sys: faqGroup.sys,
          fields: {
            ...faqGroup.fields,
            relatedFaQs: {
              "en-US": faqLinks,
            },
          },
        }
      );

      await cmaClient.entry.publish({ entryId: faqGroupId }, updatedEntry);
    } catch (error) {
      console.log(error);
      console.log("id: ", faq.sys.id);
      console.log("url: ", faqUrl);
      return;
    }
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
        "fields.type": "directory",
      },
    });
  }
  // Iterable object
  return {
    // Iterator function, returns iterator object
    [Symbol.asyncIterator]: async function* () {
      let cursor = 0;

      while (true) {
        const dataSlice = await faqSearchPagination(type, cursor);

        for (const [idx, item] of dataSlice.items.entries()) {
          yield item;
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
      limit: 950, // update if number of faqGroups increases
    },
  });

  for (const faqGroup of faqGroupList.items) {
    urlGroupIdMap.set(faqGroup.fields.directoryUrl["en-US"], faqGroup.sys.id);
  }

  return urlGroupIdMap;
}

/**
 * Accumulate list of unique faqs
 */
function linksAccumulator(faqGroup, newFaq) {
  // Default value in case there are no links
  const faqGroupLinks = faqGroup.fields.relatedFaQs?.["en-US"]
    ? faqGroup.fields.relatedFaQs["en-US"]
    : [];

  const seen = new Set();

  for (const link of faqGroupLinks) {
    if (!seen.has(link.sys.id)) {
      seen.add(link.sys.id);
    }
  }

  if (!seen.has(newFaq.sys.id)) {
    faqGroupLinks.push({
      sys: {
        type: "Link",
        linkType: "Entry",
        id: newFaq.sys.id,
      },
    });
  }

  return faqGroupLinks;
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

Collection pagination
https://www.contentful.com/developers/docs/references/content-management-api/#/reference/scheduled-actions/get-a-scheduled-action

default page size 100
max 1000
 */
