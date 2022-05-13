const fs = require("fs");
const { execSync } = require("child_process");
​
const curlHeaders = {
  accept: "application/vnd.frograms+json;version=20",
  // "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "ko,en-US;q=0.9,en;q=0.8,ko-KR;q=0.7",
  // "Cache-Control": "no-cache",
  // Connection: "keep-alive",
  Cookie:
    "_gid=GA1.2.1432943787.1651560188; _gat_gtag_UA_27006241_7=1; _gat_UA-27006241-7=1; _ga=GA1.2.1337269639.1651560188; _ga_1PYHGTCRYW=GS1.1.1651560187.1.1.1651560254.0",
  Host: "api-pedia.watcha.com",
  Origin: "https://pedia.watcha.com",
  // Pragma: "no-cache",
  Referer: "https://pedia.watcha.com/",
  "sec-ch-ua-mobile": "0",
  "sec-ch-ua-platform": `"macOS"`,
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36",
  "x-frograms-galaxy-language": "ko",
  "x-frograms-galaxy-region": "KR",
  "x-watcha-client": "watcha-WebApp",
  "x-watcha-client-language": "ko",
  "x-watcha-client-region": "KR",
  "x-watcha-client-version": "2.0.0",
  "x-watcha-remote-addr": "115.95.235.72",
};
​
const headerText = Object.entries(curlHeaders).reduce(
  (prevVal, [key, value]) => prevVal + `-H "${key}: ${value}" `,
  ""
);
​
const MOVIE_NAME = process.env.MOVIE_NAME;
​
const getMovieName = () => {
  const response = execSync(
    `curl ${headerText} -X GET "https://api-pedia.watcha.com/api/searches?query=${encodeURIComponent(
      MOVIE_NAME
    )}"`
  );
  const parsedResponse = JSON.parse(response.toString());
  const movieCode = parsedResponse.result.top_results[0].code;
​
  return movieCode;
};
​
const getReviewData = (movieCode, page = 1) => {
  const response = execSync(
    `curl ${headerText} -X GET "https://api-pedia.watcha.com/api/contents/${movieCode}/comments?filter=all&order=popular&page=${page}&size=9"`
  );
  const parsedResponse = JSON.parse(response.toString());
​
  const reviewData = parsedResponse.result.result.map((item) => ({
    text: item.text,
    is_positive: item.user_content_action.rating >= 6 ? 1 : 0,
  }));
​
  return reviewData;
};
​
const main = async () => {
  let buffer = [];
  const movieCode = await getMovieName();
​
  for (let i = 0; i < 6; i++) {
    const reviewData = await getReviewData(movieCode, i + 1);
    buffer = buffer.concat(reviewData);
  }
​
  fs.writeFileSync(`${MOVIE_NAME}_reviews.json`, JSON.stringify(buffer));
};
​
main();