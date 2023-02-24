import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import contentful from "contentful-management";

dotenv.config();

// With scoped space and environment
export const scopedPlainClient = contentful.createClient(
  {
    // This is the access token for this space. Can get the token in the Contentful web app
    accessToken: process.env.PERSONAL_TOKEN,
  },
  {
    type: "plain",
    defaults: {
      spaceId: process.env.SPACE_ID,
      environmentId: process.env.ENVIRONMENT_ID, // ALWAYS TEST IN TEST ENVIRONMENT
    },
  }
);

export default scopedPlainClient;
