"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { constants } from "./constants";
import { ChecklistItem } from "../components/checklist";

// Define the response type
interface VerificationResponse {
  checklistItems: ChecklistItem[];
  recommendations?: string[];
  additionalObservations?: string[];
}

export async function processVideoVerification(
  formData: FormData,
  mimeType: string, // MIME type of the video
  checklistItems: ChecklistItem[],
): Promise<VerificationResponse> {
  // Convert FormData to base64 string for Gemini API
  const videoFile = formData.get('video') as File;
  if (!videoFile) {
    throw new Error("No video file found in FormData");
  }
  
  const videoBuffer = await videoFile.arrayBuffer();
  const videoBase64 = Buffer.from(videoBuffer).toString('base64');
  try {
    const genAI = new GoogleGenerativeAI(constants.GEMINI_API_KEY);

    // Choose a Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            checklistItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    description: "The title of the checklist item",
                    type: "string",
                  },
                  description: {
                    description: "The description of the checklist item",
                    type: "string",
                  },
                  status: {
                    description:
                      "The verification status of the checklist item",
                    type: "string",
                    enum: ["unverified", "verified", "declined"],
                  },
                },
                required: ["title", "status"],
              },
            },
            recommendations: {
              type: "array",
              description: "Recommendations for the user",
              items: {
                type: "string",
              },
            },
            additionalObservations: {
              type: "array",
              description: "Additional observations",
              items: {
                type: "string",
              },
            },
          },
          required: ["checklistItems"],
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Create checklist items for the prompt
    const checklistForPrompt = checklistItems.map((v) => ({
      ...v,
      status: "unverified",
    }));
    // Generate content using the video data
    const result = await model.generateContent(
      [
        {
          inlineData: {
            mimeType: mimeType,
            data: videoBase64,
          },
        },
        {
          text: `
VIDEO VERIFICATION AND ANALYSIS PROMPT

You are a precise video analysis assistant. Your task is to analyze the uploaded video and verify ONLY the specific items or conditions that I explicitly list in my checklist.

IMPORTANT: Do not add additional checklist items beyond what I've specified. Focus solely on verifying the exact items I've requested.

For each checklist item, provide a verification status using the following format:
- verified: The item/condition is clearly visible and matches the description
- declined: The item/condition is definitely not in the video
- unverified: Cannot determine with confidence (provide specific reason - e.g., "poor lighting," "object partially visible," "camera angle limited")

CHECKLIST:
${JSON.stringify(checklistForPrompt, null, 2)}

The "additional_observations" field is for any notable items that were not part of your checklist but might be relevant. These observations do not affect the verification results of your specified checklist items.
`,
        },
      ],
      {},
    );

    // Parse the response
    const responseText = result.response.text();
    const response: VerificationResponse = JSON.parse(responseText);

    return response;
  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    throw error;
  }
}
