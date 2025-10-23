const fs = require("fs/promises");
const path = require("path");
const vm = require("vm");

const TARGET_DIR = "./sound";

async function run() {
  const sourcePath = path.resolve(__dirname, TARGET_DIR);

  try {
    const files = await fs.readdir(sourcePath);
    const jsFiles = files.filter((file) => path.extname(file) === ".js");

    if (jsFiles.length === 0) {
      console.log(`No .js files found in the directory ${sourcePath}`);
      return;
    }

    console.log(
      `Found ${jsFiles.length} .js files in the directory ${sourcePath}`,
    );

    for (const file of jsFiles) {
      const filePath = path.join(sourcePath, file);
      const baseName = path.basename(file, ".js");
      const jsonOutputPath = path.join(sourcePath, `${baseName}.json`);

      try {
        const code = await fs.readFile(filePath, "utf8");

        const context = {};
        vm.createContext(context);

        vm.runInContext(code, context);

        // There is no consistent variable name
        // const varName = `_tone_${baseName}`;
        const varName = Object.keys(context)[0];

        const data = context[varName];

        if (data === undefined) {
          console.warn(`Variable ${varName} not found in file ${file}`);
          continue;
        }

        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(jsonOutputPath, jsonString);
        console.log(`Converted ${file} to ${baseName}.json`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${sourcePath}:`, error);
  }
}

run();
