const fs = require("fs/promises");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables from the .env file
require("dotenv").config();

// --- 1. CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE_NAME = process.env.TABLE; //change this later

const BATCH_SIZE = 100;

async function pushToSupabase(batchData) {
  try {
    const { error } = await supabase.from(TABLE_NAME).upsert(batchData);

    if (error) {
      throw error;
    }
    console.log(
      `Successfully pushed chunk of ${batchData.length} rows to Supabase.`,
    );
  } catch (error) {
    console.error(
      `Database insertion error occurred: ${error.message || error}`,
    );
  }
}

async function uploadFolder(FOLDER_PATH) {
  let batch = [];
  let totalInserted = 0;

  try {
    // Read files from the target directory
    const files = await fs.readdir(FOLDER_PATH);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    console.log(`Total files detected for processing: ${jsonFiles.length}`);

    for (const filename of jsonFiles) {
      const filePath = path.join(FOLDER_PATH, filename);

      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const rawJson = JSON.parse(fileContent);

        // --- 2. CLEAN PARSING ---
        const permitBlock = rawJson.permit || {};

        const pId = permitBlock.PermitId;
        const pNum = permitBlock.PermitNumber;
        const status = permitBlock.PermitStatus;

        // Safety check: Skip files missing the key identifier
        if (!pId) {
          console.log(
            `Skipping ${filename}: No PermitId found in the 'permit' block.`,
          );
          continue;
        }

        // --- 3. BUILD THE ROW ---
        batch.push({
          permit_id: pId,
          permit_number: pNum ? pNum : "UNKNOWN",
          status: status ? status : "UNKNOWN",
          permit_data: rawJson,
        });
      } catch (err) {
        console.error(
          `Error reading or parsing file ${filename}: ${err.message}`,
        );
        continue;
      }

      // --- 4. BATCH PUSH ---
      if (batch.length >= BATCH_SIZE) {
        await pushToSupabase(batch);
        totalInserted += batch.length;
        batch = [];
      }
    }

    // Push any remaining records
    if (batch.length > 0) {
      await pushToSupabase(batch);
      totalInserted += batch.length;
    }

    console.log(`\n Upload complete. Total rows uploaded: ${totalInserted}`);
  } catch (err) {
    console.error(`Error accessing folder path: ${err.message}`);
  }
}

module.exports = uploadFolder;
