const fs = require("fs");
const path = require("path");

const get_contacts = require("../Data_APIs/contacts.js");
const get_fees = require("../Data_APIs/fees.js");
const get_holds = require("../Data_APIs/holds.js");
const get_inspection = require("../Data_APIs/inspection.js");
const get_permit = require("../Data_APIs/permit.js");
const get_summary = require("../Data_APIs/summary.js");

// const file =
//   "C:\\Users\\itsro\\OneDrive\\Desktop\\County Scrapers\\tyler.host Updater\\issued_permits.json"; // input file
// const outputFolder = path.join(__dirname, "permits");
// const outputFolder = "permits";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Ensure the "permits" folder exists
// if (!fs.existsSync(outputFolder)) {
//   fs.mkdirSync(outputFolder, { recursive: true });
// }

async function fetchNewPermits(file, outputFolder = "permits") {
  try {
    // Ensure the "permits" folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Read and parse input file
    const fileContent = fs.readFileSync(file, "utf8");
    const permits = JSON.parse(fileContent);

    console.log(`Loaded ${permits.length} cases. Starting data extraction...`);

    for (const permitCase of permits) {
      //remove later
      // const { CaseId, CaseNumber } = permitCase;

      const CaseId = permitCase.permit_id || permitCase.CaseId;
      // Try to get permit_number, if not there, fallback to CaseNumber
      const CaseNumber = permitCase.permit_number || permitCase.CaseNumber;

      if (!CaseId || !CaseNumber) {
        console.warn("Skipping record due to missing CaseId or CaseNumber.");
        continue;
      }

      console.log(`Processing Case: ${CaseNumber} (${CaseId})...`);

      try {
        const [contacts, fees, holds, inspections, permit, summary] =
          await Promise.all([
            get_contacts(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
            get_fees(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
            get_holds(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
            get_inspection(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
            get_permit(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
            get_summary(CaseId).catch((err) => ({
              error: true,
              message: err.message,
            })),
          ]);

        // Structure the consolidated object
        const consolidatedData = {
          metadata: permitCase, // Optional: keeps original file values alongside details
          contacts,
          fees,
          holds,
          inspections,
          permit,
          summary,
        };

        // Sanitize CaseNumber to ensure valid filesystem filename
        const safeFileName = `${CaseNumber.replace(/[/\\?%*:|"<>]/g, "-")}.json`;
        const destinationPath = path.join(outputFolder, safeFileName);

        // Write the gathered data to its file
        fs.writeFileSync(
          destinationPath,
          JSON.stringify(consolidatedData, null, 2),
        );
        console.log(`Saved -> ${safeFileName}`);
        await delay(500); // doubled the delay timings
      } catch (caseError) {
        console.error(`Error processing Case ${CaseNumber}:`, caseError);
      }
    }

    console.log("All tasks completed.");
  } catch (err) {
    console.error("Failed to run extraction process:", err);
  }
}

module.exports = fetchNewPermits;
