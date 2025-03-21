// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { constants } from "./constants";
import fs from "fs";

const files = [
  {
    path: "files/test.mp4",
    mimeType: "video/mp4",
  },
  {
    path: "files/1.mov",
    mimeType: "video/quicktime",
  },
  {
    path: "files/2.mov",
    mimeType: "video/quicktime",
  },
  {
    path: "files/3.mov",
    mimeType: "video/quicktime",
  },
];

const genAI = new GoogleGenerativeAI(constants.GEMINI_API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        verification_results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                description: "The ID of the checklist item",
                type: "string",
              },
              description: {
                description: "The description of the checklist item",
                type: "string",
              },
              status: {
                description: "The verification status of the checklist item",
                type: "string",
                enum: ["verified", "not present", "uncertain"],
              },
            },
            required: ["description", "status"],
          },
        },
        recommendations: {
          type: "array",
          description: "Recommendations for the user",
          items: {
            type: "string",
          },
        },
        additional_observations: {
          type: "array",
          description: "Additional observations",
          items: {
            type: "string",
          },
        },
      },
      required: ["verification_results"],
    } as any,
  },
});

// Generate content using text and the URI reference for the uploaded file.
const generate = async (file: (typeof files)[number]) => {
  // Only for videos of size <20Mb
  const videoBytes = fs.readFileSync(file.path, { encoding: "base64" });
  return model
    .generateContent(
      [
        {
          inlineData: {
            mimeType: "video/quicktime",
            data: videoBytes,
          },
        },
        {
          text: `
VIDEO VERIFICATION AND ANALYSIS PROMPT

You are a precise video analysis assistant. Your task is to analyze the uploaded video and verify ONLY the specific items or conditions that I explicitly list in my checklist.

IMPORTANT: Do not add additional checklist items beyond what I've specified. Focus solely on verifying the exact items I've requested.

For each checklist item, provide a verification status using the following format:
- VERIFIED: The item/condition is clearly visible and matches the description
- NOT PRESENT: The item/condition is definitely not in the video
- UNCERTAIN: Cannot determine with confidence (provide specific reason - e.g., "poor lighting," "object partially visible," "camera angle limited")

CHECKLIST:
[
  {
    "id": "KID_BOOK_READING",
    "description": "A small kid is visible in the video studying a book"
  },
  {
    "id": "OBJECT_KINDLE",
    "description": "A Kindle is present on the table"
  },
  {
    "id": "OBJECT_AC_REMOTE",
    "description": "An AC remote is present on the table"
  },
  {
    "id": "OBJECT_MOBILE",
    "description": "A mobile phone is present on the table"
  },
  {
    "id": "OBJECT_MONITOR",
    "description": "A monitor is present on the table"
  },
  {
    "id": "OBJECT_LAPTOP",
    "description": "A laptop is present on the table"
  }
]

The "additional_observations" field is for any notable items that were not part of your checklist but might be relevant. These observations do not affect the verification results of your specified checklist items.
`,
        },
      ],
      {},
    )
    .then((v) => v.response.text());
};

const results = await Promise.all(
  files.map(async (v, i) => {
    await new Promise((resolve) => setTimeout(resolve, 5000 * i));
    const result = await generate(v)
      .then((v) => JSON.parse(v))
      .catch((err) => err);
    console.log("RESULT: ", result);

    return {
      result,
      ...v,
    };
  }),
);

fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
