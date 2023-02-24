import moment from "moment";

export const extractUrl = (html) => {
  let url = html.replaceAll(/<[^>]*>/g, "");
  if (url.startsWith("https://www.expertise.com/")) {
    return url;
  } else {
    console.log("Error extracting url");
  }
};

export const formatDate = (string) => {
  // Contenful format: { 'en-US': '2023-02-23T00:00-08:00' }
  // SF format: 2/12/2023 10:16 PM // What timezone?
  return moment(string, "M-D-YYYY LT").format();
};

export const wrapInLocaleObj = (value) => {
  return { "en-US": value };
};

// Returns a promise that resolves after _seconds_
export const delay = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
