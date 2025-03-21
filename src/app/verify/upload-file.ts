// To use the File API, use this import path for GoogleAIFileManager.
// Note that this is a different import path than what you use for generating content.
// For versions lower than @google/generative-ai@0.13.0
// use "@google/generative-ai/files"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { constants } from "./constants";

// Initialize GoogleAIFileManager with your GEMINI_API_KEY.
const fileManager = new GoogleAIFileManager(constants.GEMINI_API_KEY);

// Upload the file and specify a display name.
const uploadResponse = await fileManager.uploadFile("files/test.mp4", {
  mimeType: "video/mp4",
  displayName: "test.mp4",
});

// View the response.
console.log(
  `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`,
);

// Upload the video file using the File API
// uploadResponse = ...
const name = uploadResponse.file.name;

// Poll getFile() on a set interval (10 seconds here) to check file state.
let file = await fileManager.getFile(name);
while (file.state === FileState.PROCESSING) {
  process.stdout.write(".");
  // Sleep for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  // Fetch the file from the API again
  file = await fileManager.getFile(name);
}

if (file.state === FileState.FAILED) {
  throw new Error("Video processing failed.");
}

// When file.state is ACTIVE, the file is ready to be used for inference.
console.log(`File ${file.displayName} is ready for inference as ${file.uri}`);

console.log("RESULT:::");
console.log(JSON.stringify(file, null, 2));
