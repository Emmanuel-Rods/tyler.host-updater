const fs = require("fs").promises;

async function appendToJsonFile(filename, newObjectsArray) {
  let currentData = [];

  try {
    // Try to read the existing file
    const fileContent = await fs.readFile(filename, "utf8");
    if (fileContent.trim()) {
      currentData = JSON.parse(fileContent);
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error reading or parsing existing JSON file:", error);
      throw error;
    }
  }

  currentData.push(...newObjectsArray);

  await fs.writeFile(filename, JSON.stringify(currentData, null, 2), "utf8");

  console.log(
    `✅ Appended ${newObjectsArray.length} items. Total items in file: ${currentData.length}`,
  );
}

module.exports = appendToJsonFile;
