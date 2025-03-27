"use client";
import { useState } from "react";
import { processVideoVerification } from "./actions";
import {
  VerificationScreen,
  VerificationScreenState,
} from "../components/verification-screen";
import { VideoRecorder, RecordedVideoData } from "../components/video-recorder";
import { ChecklistItem } from "../components/checklist";

// Mock data - initial checklist items
const initialChecklistItems: ChecklistItem[] = [
  {
    title: "A man holding a mobile",
    status: "unverified",
  },
  {
    title: "A pen should be visible",
    status: "unverified",
  },
  {
    title: "A watch should be present.",
    status: "unverified",
  },
];

// Check if all items are verified
const areAllItemsVerified = (items: ChecklistItem[]): boolean => {
  return items.every((item) => item.status === "verified");
};

export default function VerifyPage() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    initialChecklistItems,
  );
  const [showRecorder, setShowRecorder] = useState(false);
  const [screenState, setScreenState] =
    useState<VerificationScreenState>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleRecordClick = () => {
    setShowRecorder(true);
  };

  const handleCancelRecording = () => {
    setShowRecorder(false);
  };

  const handleVideoRecorded = async (videoData: RecordedVideoData) => {
    setShowRecorder(false);
    setIsLoading(true);

    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    try {
      console.log(
        "Processing video recording:",
        videoData.file.name,
        "Type:",
        videoData.mimeType,
      );

      try {
        // Convert the file to base64
        const base64Data = await fileToBase64(videoData.file);
        console.log("Base64 conversion successful");

        // Use our server action to process the video
        const response = await processVideoVerification(
          base64Data,
          videoData.mimeType,
          checklistItems,
        );

        console.log("AI RESPONSE: ", response);
        const { checklistItems: updatedItems } = response;

        console.log(
          "Video processing complete, updating checklist items",
          updatedItems,
        );
        setChecklistItems(updatedItems);

        // Check if all items are verified
        if (areAllItemsVerified(updatedItems)) {
          setScreenState("success");
        } else {
          setScreenState("update");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (conversionError: any) {
        console.error("Error converting video to base64:", conversionError);
        throw new Error(`Failed to convert video: ${conversionError.message}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error processing video:", error);
      // You might want to show an error message to the user here
      // For now, we'll just update the screen state to show there was an error
      setScreenState("update");

      // In a real app, you would show this error to the user
      alert(`Error processing video: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result;
          if (typeof result !== "string") {
            reject(new Error("FileReader result is not a string"));
            return;
          }

          console.log("File read complete, data URL length:", result.length);

          // Safely extract the base64 data part
          // Data URLs are formatted as: data:[<mediatype>][;base64],<data>
          const base64Match = result.match(/^data:.*;base64,(.*)$/);
          if (!base64Match) {
            console.error(
              "Could not extract base64 data from:",
              result.substring(0, 100) + "...",
            );
            reject(new Error("Invalid data URL format"));
            return;
          }

          const base64Data = base64Match[1];
          console.log("Extracted base64 data length:", base64Data.length);

          resolve(base64Data);
        } catch (error) {
          console.error("Error in fileToBase64:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };

      // Log file details before reading
      console.log(
        "Reading file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type,
      );
      reader.readAsDataURL(file);
    });
  };

  const handleContinueClick = () => {
    // Reset to recording state to try again
    setShowRecorder(true);
  };

  // If showing recorder, render the VideoRecorder component
  if (showRecorder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="container mx-auto p-4 max-w-3xl">
          <div className="h-[600px] bg-black rounded-lg overflow-hidden">
            <VideoRecorder
              onDone={handleVideoRecorded}
              onCancel={handleCancelRecording}
              maxDuration={60} // 60 seconds max
            />
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the VerificationScreen with appropriate state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto p-4 max-w-3xl">
        <VerificationScreen
          title={
            screenState === "update"
              ? "Continue Verification"
              : "Video Verification"
          }
          description={
            screenState === "update"
              ? "Review your verification status"
              : "Get started by recording a video"
          }
          checklistItems={checklistItems}
          onRecordClick={handleRecordClick}
          onContinueClick={
            screenState === "update" ? handleContinueClick : undefined
          }
          isLoading={isLoading}
          state={screenState}
        />
      </div>
    </div>
  );
}
