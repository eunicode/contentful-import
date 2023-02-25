import cmaClient from "../helpers/client.js";
import { extractUrl, wrapInLocaleObj, delay } from "../helpers/helpers.js";
import workPerCsvRow from "../helpers/csv-parse.js";

// getMany()
// {
//   items: [{fields: {question: {}, answer: {}, directoryUrl: {'en-US': string}}}]
// }

const urlGroupIdMap = new Map();

const faqGroupList = await cmaClient.entry.getMany({
  query: {
    content_type: "faqDirectoryGroup",
  },
});

// for (const faqGroup of faqGroupList.items) {
//   urlGroupIdMap.set(faqGroup.fields.directoryUrl["en-US"], faqGroup.sys.id);
// }

// let faqs = faqSearch("faq", 10);

let x = await cmaClient.entry.get({ entryId: "6j4puCWxawaaDmoTPABDgE" });
console.log(x.sys.version);

await cmaClient.entry.update(
  { entryId: "6j4puCWxawaaDmoTPABDgE" },
  {
    sys: x.sys,
    fields: {
      ...x.fields,
      relatedFaQs: {
        "en-US": [
          {
            sys: {
              type: "Link",
              linkType: "Entry",
              id: "3KZuM3kxFZ7u9Luxq6f7oP",
            },
          },
        ],
      },
    },
  }
);

// for await (const faq of faqs) {
//   if (!faq.fields.directoryUrl) {
//     break;
//   }

//   let faqUrl = faq.fields.directoryUrl["en-US"];

//   console.log(urlGroupIdMap.get(faqUrl)); // 6j
//   console.log(faq.sys.id); //3K
//   await cmaClient.entry.update(
//     { entryId: urlGroupIdMap.get(faqUrl) },
//     {
//       fields: {
//         relatedFaQs: {
//           "en-US": [
//             {
//               sys: {
//                 type: "Link",
//                 linkType: "Entry",
//                 id: faq.sys.id,
//               },
//             },
//           ],
//         },
//       },
//     }
//   );
// }

function faqSearch(type, size) {
  function faqSearchPagination(type, cursor) {
    return cmaClient.entry.getMany({
      query: {
        skip: cursor,
        limit: size,
        order: "-sys.createdAt",
        content_type: type,
        // fields.directoryUrl: 'https://www.expertise.com/ca/hayward/motorcycle-accident-lawyer'
      },
    });
  }
  // Generator
  return {
    [Symbol.asyncIterator]: async function* () {
      let cursor = 0;

      while (cursor < 50) {
        // while (true) {
        await delay(0.3);
        const dataSlice = await faqSearchPagination(type, cursor);
        for (const item of dataSlice.items) {
          yield item;
        }

        cursor = cursor + size;
      }
    },
  };
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

/* 
 'X-Contentful-Version': (_rawData$sys$version = rawData.sys.version) !== null && _rawData$sys$version !== void 0 ? _rawData$sys$version : 0
*/
