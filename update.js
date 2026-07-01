//status
const getDataByStatus = require("./db/getPreviousData.js");
const fetchNewPermits = require("./utils/fetchPermits.js");

const cleanJsonFiles = require("./utils/cleaner.js");
const compareData = require("./utils/compare.js");

const uploadFolder = require("./db/upload.js");

const cleanupFolders = require("./utils/deleteFolders.js");
const fs = require("fs");

async function process(status) {
  //get
  console.log(
    "\x1b[33m Now fetching all permit data based on the selected status... \x1b[0m",
  );
  const datafile = await getDataByStatus(status);

  //new permits
  console.log("\x1b[33m Now downloading and saving new permits... \x1b[0m");

  await fetchNewPermits(datafile); //saves data to permits folder

  //cleaning
  console.log(
    "\x1b[33m Now cleaning and processing permit JSON files... \x1b[0m",
  );

  await cleanJsonFiles("permits", "cleaned_permits");

  //comparing
  console.log(
    "\x1b[33m Now comparing cleaned data with existing records... \x1b[0m",
  );
  await compareData(datafile, "cleaned_permits", "DIFF_FOLDER");
  //then push the diff folder to db

  console.log("\x1b[33m Now pushing folder to DB \x1b[0m");

  await uploadFolder("DIFF_FOLDER");

  //delete diff_folder , permits , and cleaned_permits folders
  await cleanupFolders(["DIFF_FOLDER", "permits", "cleaned_permits"]);
  fs.rmSync(datafile, { force: true });
}

// process(status);

const statuses = ["Issued"];

async function update() {
  for (const status of statuses) {
    await process(status);
    console.log(`Completed : ${status}`);
  }
  console.log("All statuses Completed");
}

update();
