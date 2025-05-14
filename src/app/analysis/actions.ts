"use server";

import {
  createPartFromUri,
  createUserContent,
  FileState,
  GoogleGenAI,
  SchemaUnion,
  Type,
} from "@google/genai";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { constants } from "../verify/constants";
import ffmpeg from "fluent-ffmpeg";
import { manualObservations } from "./manual-observations";

// Define the response types
export interface AnalysisObservation {
  id: string;
  description: string;
  sentiment: "positive" | "negative";
  type: "cleanliness" | "maintenance" | "styling";
  timestamp?: string;
}

export interface VideoAnalysis {
  id: string;
  title: string;
  videoUrl: string;
  aiObservations: AnalysisObservation[];
  summary: string;
  duration?: string;
}

interface AIResponse {
  observations: {
    description: string;
    sentiment: "positive" | "negative";
    type: "cleanliness" | "maintenance";
    timestamp: string;
  }[];
}

export async function processVideoAnalysis(
  formData: FormData,
  skipFileOperations: boolean = true,
): Promise<{
  success: boolean;
  message: string;
  analysis?: VideoAnalysis;
  filename?: string;
}> {
  // Get the uploaded file
  const file = formData.get("video") as File;
  const fileUrl = formData.get("videoUrl") as string;
  const fileType = formData.get("videoType") as string;
  try {
    // Create a unique ID for the analysis
    const analysisId = uuidv4();
    let aiResponse;

    if (file) {
      // Store the original filename for error reporting
      const originalFilename = file.name;

      // Get the filename and extension
      const fileExtension = path.extname(originalFilename);
      const filenameWithoutExt = path.basename(originalFilename, fileExtension);

      // Define paths for the video and JSON files
      // Always use .mp4 extension for the output file
      const mp4Filename = `${filenameWithoutExt}.mp4`;

      if (!skipFileOperations) {
        // Ensure the videos directory exists
        const publicDir = path.join(process.cwd(), "public");
        const videosDir = path.join(publicDir, "videos");

        if (!fs.existsSync(videosDir)) {
          await mkdir(videosDir, { recursive: true });
        }

        const videoPath = path.join(videosDir, mp4Filename);

        // Check if files already exist
        if (fs.existsSync(videoPath)) {
          console.log(
            `File ${mp4Filename} already exists, skipping this file.`,
          );
          return {
            success: false,
            message: `A file with the name ${mp4Filename} already exists and was skipped.`,
            filename: originalFilename,
          };
        }

        // Convert the file to a Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a temporary path for the original video
        const tempOriginalPath = path.join(
          videosDir,
          `temp_original_${originalFilename}`,
        );

        // Save the original video file to temp location
        await writeFile(tempOriginalPath, buffer);

        // Compress the video using fluent-ffmpeg
        await compressVideo(tempOriginalPath, videoPath);

        // Remove the temporary original file
        fs.unlinkSync(tempOriginalPath);

        // Read the processed file
        const processedBuffer = fs.readFileSync(videoPath);

        // For smaller files, use base64 encoding
        const base64Video = processedBuffer.toString("base64");
        aiResponse = await analyzeVideoWithAI(base64Video, file.type);
      } else {
        // Skip file operations and directly analyze the video
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Video = buffer.toString("base64");
        aiResponse = await analyzeVideoWithAI(base64Video, file.type);
      }

      // Transform AI response to our format
      const aiObservations = aiResponse?.observations.map((obs, index) => ({
        id: `ai-${index}`,
        description: obs.description,
        type: obs.type,
        sentiment: obs.sentiment,
        timestamp: obs.timestamp,
      }));

      // Create the analysis object
      const analysis: VideoAnalysis = {
        id: analysisId,
        title: filenameWithoutExt,
        videoUrl: `/videos/${filenameWithoutExt}.mp4`,
        aiObservations: aiObservations,
        summary: generateSummary(aiObservations),
      };

      // Save the analysis as JSON if not skipping file operations
      if (!skipFileOperations) {
        const publicDir = path.join(process.cwd(), "public");
        const videosDir = path.join(publicDir, "videos");
        const jsonPath = path.join(videosDir, `${filenameWithoutExt}.json`);
        await writeFile(jsonPath, JSON.stringify(analysis, null, 2));
      }

      return {
        success: true,
        message: "Video uploaded and analyzed successfully",
        analysis,
        filename: originalFilename,
      };
    } else if (fileType && fileUrl) {
      aiResponse = await analyzeVideoWithFileAPI(fileUrl, fileType);

      // Transform AI response to our format
      const aiObservations = aiResponse?.observations.map((obs, index) => ({
        id: `ai-${index}`,
        description: obs.description,
        type: obs.type,
        sentiment: obs.sentiment,
        timestamp: obs.timestamp,
      }));

      // Create the analysis object
      const analysis: VideoAnalysis = {
        id: analysisId,
        title: "ignore",
        videoUrl: "ignore",
        aiObservations: aiObservations,
        summary: generateSummary(aiObservations),
      };
      return {
        success: true,
        message: "Video uploaded and analyzed successfully",
        analysis,
        filename: "ignore",
      };
    } else {
      return { success: false, message: "No video file provided" };
    }
  } catch (error) {
    console.error("Error processing video:", error);
    return {
      success: false,
      message: `Error processing video: ${error instanceof Error ? error.message : String(error)}`,
      filename: file?.name,
    };
  }
}

// Common response schema for Gemini API
const getResponseSchema = (): SchemaUnion => ({
  type: Type.OBJECT,
  properties: {
    observations: {
      type: Type.ARRAY,
      description: "Array of observation objects",
      items: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description:
              "Detailed description of the observation (e.g., 'The room looks clean')",
          },
          sentiment: {
            type: Type.STRING,
            description: "Whether the observation is positive or negative",
            enum: ["positive", "negative"],
          },
          type: {
            type: Type.STRING,
            description: "Category of the observation",
            enum: ["cleanliness", "maintenance"],
          },
          timestamp: {
            type: Type.STRING,
            description:
              "Timestamp in the video where this observation was made (e.g., '0:45', '2:12')",
          },
        },
        required: ["description", "sentiment", "type", "timestamp"],
      },
    },
  },
  required: ["observations"],
});

// Common prompt text for video analysis
const getAnalysisPrompt = () => `# Property Inspection Video Analysis

You are a hospitality quality assurance specialist with expertise in property assessment. Your job is to carefully analyze property videos and identify both strengths and areas needing improvement.

## Purpose
Analyze property videos to identify both positive aspects and issues needing attention in cleanliness and maintenance.

## Instructions
1. Watch the entire video carefully.
2. Note specific observations about the property's condition.
3. Classify each observation as "positive" or "negative."
4. IMPORTANT: For each observation, include a precise timestamp in the format "M:SS" (e.g., "0:45", "2:12").

## Areas to Focus On

### Cleanliness
- Floors and carpets
- Bathrooms
- Kitchen areas
- Furniture
- Windows
- Corners and edges
- Odors (if apparent)

### Maintenance
- Walls and ceilings
- Fixtures and fittings
- Appliances
- Doors and windows
- Furniture condition
- Electrical components
- Plumbing
- Heating/cooling systems

Remember to be detailed and specific in your observations to help maintain our high standards. Always include a timestamp for each observation so we can easily locate the issue in the video.`;

const genAI = new GoogleGenAI({ apiKey: constants.GEMINI_API_KEY || "" });

async function analyzeVideoWithFileAPI(
  fileUrl: string,
  mime: string,
): Promise<AIResponse> {
  try {
    console.log("DOWNLOADING FILE: ", fileUrl, mime);
    const downloadFile = await fetch(fileUrl).then((res) => res.blob());
    // Store in tmp file.
    const tempFilePath = path.join(
      process.cwd(),
      "tmp",
      `temp_video_${uuidv4()}.webm`,
    );
    // Ensure the tmp directory exists
    if (!fs.existsSync(path.join(process.cwd(), "tmp"))) {
      await mkdir(path.join(process.cwd(), "tmp"), { recursive: true });
    }

    // Store in tempFilePath
    const fileBuffer = await downloadFile.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    // Write buffer to file.
    fs.writeFileSync(tempFilePath, buffer);

    let myfile = await genAI.files.upload({
      file: tempFilePath,
      config: { mimeType: mime },
    });
    console.log("GENERATING CONTENT", myfile.uri, myfile.mimeType);

    let count = 0;
    while (
      myfile.state !== FileState.ACTIVE &&
      myfile.state !== FileState.FAILED
    ) {
      console.log(`BEFORE IN STATE: ${count}`, myfile.state);
      myfile = await genAI.files.get({ name: myfile.name! });
      console.log(`IN STATE: ${count++}`, myfile.state);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (myfile.state === FileState.FAILED) {
      throw new Error("File upload to google failed.");
    }
    // Generate content using the file URI
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(),
      },
      contents: createUserContent([
        createPartFromUri(myfile.uri!, myfile.mimeType!),
        getAnalysisPrompt(),
      ]),
    });

    const response: AIResponse = JSON.parse(result.text ?? "");

    // Remove the temporary file
    fs.unlinkSync(tempFilePath);

    return response;
  } catch (error) {
    console.error("Error processing video with File API:", error);
    throw error;
  }
}

async function analyzeVideoWithAI(
  videoData: string,
  mimeType: string,
): Promise<AIResponse> {
  try {
    // Generate content using the video data
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(),
      },
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: videoData,
          },
        },
        {
          text: getAnalysisPrompt(),
        },
      ],
    });

    // Parse the response
    const responseText = result.text ?? "";
    const response: AIResponse = JSON.parse(responseText);

    return response;
  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    throw error;
  }
}

// Helper function to generate a summary based on observations
function generateSummary(observations: AnalysisObservation[]): string {
  const positiveCount = observations.filter(
    (obs) => obs.sentiment === "positive",
  ).length;
  const negativeCount = observations.filter(
    (obs) => obs.sentiment === "negative",
  ).length;
  const cleanlinessCount = observations.filter(
    (obs) => obs.type === "cleanliness",
  ).length;
  const maintenanceCount = observations.filter(
    (obs) => obs.type === "maintenance",
  ).length;

  return `Analysis found ${observations.length} observations: ${positiveCount} positive and ${negativeCount} negative. 
  There were ${cleanlinessCount} cleanliness observations and ${maintenanceCount} maintenance observations.`;
}

// Function to compress video using fluent-ffmpeg
function compressVideo(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure output path has .mp4 extension
    const outputPathMp4 = outputPath.replace(/\.[^/.]+$/, "") + ".mp4";

    ffmpeg(inputPath)
      .outputFormat("mp4")
      .videoCodec("libx264")
      .noAudio() // Remove audio completely
      .outputOptions([
        "-pix_fmt yuv420p", // Ensure compatibility
        "-profile:v baseline", // Use baseline profile for better compatibility
        "-level 3.0",
        "-movflags +faststart", // Optimize for web playback
        "-preset ultrafast", // Fastest encoding preset
        "-crf 28", // Higher CRF = lower quality but faster encoding (23->28)
        "-vf scale=854:-2", // Scale to 480p while maintaining aspect ratio
      ])
      .on("start", (commandLine) => {
        console.log("FFmpeg command:", commandLine);
      })
      .on("progress", (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on("end", () => {
        console.log("Video compression completed successfully");
        resolve();
      })
      .on("error", (err: unknown) => {
        console.error("Error compressing video:", err);
        reject(err);
      })
      .save(outputPathMp4);
  });
}

// Function to load all available analyses
export async function loadAllAnalyses(
  baseUrl: string,
): Promise<(VideoAnalysis & { manualObservations: AnalysisObservation[] })[]> {
  try {
    // Fetch and parse each JSON file
    const analysesPromises = [
      "IMG 3847",
      "IMG 3848",
      "IMG_3847",
      "IMG_3848",
      "IMG_3849",
      "IMG_3850",
      "IMG_3852",
      "IMG_3853",
      "IMG_3854",
      "IMG_3856",
      "IMG_3858",
      "IMG_3859",
      "IMG_3865",
      "IMG_3868",
      "IMG_3870",
      "IMG_3875",
      "IMG_3876",
      "IMG_3877",
      "IMG_3880",
      "IMG_3882",
      "IMG_3885",
      "IMG_3886",
    ].map(async (filename: string) => {
      const jsonUrl = `${baseUrl}/videos/${filename}.json`;
      const jsonResponse = await fetch(jsonUrl);

      if (!jsonResponse.ok) {
        console.error(
          `Failed to fetch ${filename}: ${jsonResponse.statusText}`,
        );
        return null;
      }

      const analysis = (await jsonResponse.json()) as VideoAnalysis;

      // Match with manual observations
      const matchingObservations =
        manualObservations[analysis.title.replaceAll("_", " ")] || [];

      return {
        ...analysis,
        manualObservations: matchingObservations,
      };
    });

    // Filter out any null results from failed fetches
    const analyses = (await Promise.all(analysesPromises)).filter(
      Boolean,
    ) as (VideoAnalysis & {
      manualObservations: AnalysisObservation[];
    })[];

    return analyses;
  } catch (error) {
    console.error("Error loading analyses:", error);
    return [];
  }
}
