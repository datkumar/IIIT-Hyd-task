import path from "node:path";
import { createInterface } from "readline";
import { writeFile } from "node:fs/promises";
import { createReadStream, existsSync, mkdirSync, rmSync } from "node:fs";
import { UserEvent, UserEventSchema } from "./models/user-event";

const inputFile = path.resolve("./data/assignment_prod.log");
const outputDirectory = path.resolve("./output");
// Delete old output directory
rmSync(outputDirectory, { recursive: true, force: true });
// Create new output directory
mkdirSync(outputDirectory);

enum Status {
  SUCCESS,
  FAIL,
}

const decodeBas64Log = (encodedString: string) => {
  try {
    const decodedString = atob(encodedString);
    return { decodeStatus: Status.SUCCESS, value: decodedString };
  } catch (error) {
    return { decodeStatus: Status.FAIL, value: encodedString };
  }
};

const extrapolateBase64Log = (decodedJsonString: string) => {
  try {
    const obj = JSON.parse(decodedJsonString);
    const validatedObject = UserEventSchema.parse(obj);
    return {
      validated: Status.SUCCESS,
      data: validatedObject,
      errorValue: null,
    };
  } catch (error) {
    return {
      validated: Status.FAIL,
      value: null,
      errorValue: decodedJsonString,
    };
  }
};

const processBase64LogLine = (line: string) => {
  // encoded part is after "BASE64:" i.e. starting from index 7
  const truncatedLine = line.slice(7);
  const encodedString = truncatedLine;

  const { decodeStatus, value } = decodeBas64Log(encodedString);
  if (decodeStatus === Status.FAIL) {
    base64UndecodedLogs.push(value);
    return;
  }

  const { data, errorValue } = extrapolateBase64Log(value);
  if (!data) {
    base64InvalidatedLogs.push(errorValue);
    return;
  }

  base64ProcessedEvents.push(data);
};

const writeAllDiscardedLogs = async () => {
  const undecodedBase64LogsFile = path.resolve("./output/base64-undecoded.log");
  const undecodedBase64LogsFileContent = base64UndecodedLogs.join("\n");
  await writeFile(undecodedBase64LogsFile, undecodedBase64LogsFileContent, {
    encoding: "utf8",
  });

  const invalidatedBase64LogsFile = path.resolve(
    "./output/base64-invalidated.log"
  );
  const invalidatedBase64LogsFileContent = base64InvalidatedLogs.join("\n");
  await writeFile(invalidatedBase64LogsFile, invalidatedBase64LogsFileContent, {
    encoding: "utf8",
  });
};

const writeBase64EventsToJson = async () => {
  const jsonObject = {
    base64TotalLogsCount,
    base64UndecodedLogsCount: base64UndecodedLogs.length,
    base64InvalidatedLogsCount: base64InvalidatedLogs.length,
    base64ProcessedLogsCount: base64ProcessedEvents.length,
    base64ProcessedLogs: base64ProcessedEvents,
  };
  // Pretty-print with 2 spaces
  const jsonString = JSON.stringify(jsonObject, null, 2);

  const processedBase64LogFile = path.resolve("./output/base64-processed.json");
  await writeFile(processedBase64LogFile, jsonString, "utf8");
};

// --------------------------------------------------------------
// Driver code

const base64UndecodedLogs: string[] = [];
const base64InvalidatedLogs: string[] = [];
const base64ProcessedEvents: UserEvent[] = [];
let base64TotalLogsCount = 0;

const processLineByLine = async () => {
  const fileStream = createReadStream(inputFile);
  // The crlfDelay option is to recognize all instances of
  // CR LF ('\r\n') in input file as a single line break
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (line.startsWith("BASE64:")) {
      base64TotalLogsCount++;
      processBase64LogLine(line);
    }
  }
};

const main = async () => {
  try {
    await processLineByLine();
    await writeBase64EventsToJson();
    await writeAllDiscardedLogs();
  } catch (error) {
    console.log(error);
  }
};
main();

// const paddedBase64String = (inputString: string) => {
//   if (inputString.length % 4 === 0) {
//     return inputString;
//   }
//   const padCount = 4 - (inputString.length % 4);
//   const paddedString = inputString + "=".repeat(padCount);
//   return paddedString;
// };
