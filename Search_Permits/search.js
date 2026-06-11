const fs = require("fs");
const appendData = require("./appender.js");
// const OUTPUT_FILE = "energov_data.json";

async function fetchEnergovData(payload) {
  const url =
    "https://wakecountync-energovpub.tylerhost.net/apps/selfservice/api/energov/search/search";

  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json;charset=UTF-8",
    origin: "https://wakecountync-energovpub.tylerhost.net",
    pragma: "no-cache",
    priority: "u=1, i",
    referer: "https://wakecountync-energovpub.tylerhost.net/apps/SelfService",
    "sec-ch-ua":
      '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    tenantid: "1",
    tenantname: "WakeCountyNCProd",
    "tyler-tenant-culture": "en-US",
    "tyler-tenanturl": "WakeCountyNCProd",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    Cookie: "Tyler-Tenant-Culture=en-US",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Response:", data);
    // fs.writeFileSync("data.json", JSON.stringify(data, null, 2)); //' save to file
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
/** Gets total pages count for given payload */
async function getTotalPages(payload) {
  try {
    const data = await fetchEnergovData(payload);
    const totalPages = data?.Result?.TotalPages;

    if (totalPages == 0) {
      return 0; // slopy code , but it didnt used to handle this freaking case
    }

    if (totalPages) {
      return totalPages;
    } else {
      throw new Error("Error while fetching Total pages");
    }
  } catch (error) {
    console.log("Error in getTotalPages", error);
  }
}

async function getAllResults(payload, status = "", outputfile) {
  try {
    const totalpages = await getTotalPages(payload);
    console.log("total pages available :", totalpages);

    for (let page = 1; page <= totalpages; page++) {
      payload.PermitCriteria.PageNumber = page; // set the pagenumber to the current page index
      const chunk = await fetchEnergovData(payload);
      await appendData(`${outputfile}`, chunk.Result.EntityResults);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = getAllResults;
