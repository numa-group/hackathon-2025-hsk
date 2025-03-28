"use client";
import { useState } from "react";
import { processVideoVerification } from "./actions";
import {
  VerificationScreen,
  VerificationScreenState,
} from "../components/verification-screen";
import { ChecklistItem } from "../components/checklist";
import {
  RecordedVideoDataNew,
  VideoRecorderNew,
} from "../components/video-recorder-new";
import { LoadingOverlay } from "../components/loading-overlay";

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

  const handleVideoRecorded = async (videoData: RecordedVideoDataNew) => {
    setShowRecorder(false);
    setIsLoading(true);

    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    try {
      console.log("Processing video recording:", "Type:", videoData.mimeType);

      try {
        // Create FormData and append the video blob
        const formData = new FormData();
        formData.append("video", videoData.blob, "recorded-video.mp4");

        // Use our server action to process the video
        const response = await processVideoVerification(
          formData,
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

  const handleContinueClick = () => {
    // Reset to recording state to try again
    setShowRecorder(true);
  };

  // If showing recorder, render the VideoRecorder component
  if (showRecorder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingOverlay
          isLoading={isLoading}
          message="Processing your video..."
        />
        <div className="container mx-auto p-4 max-w-3xl">
          <div className="h-[600px] bg-black rounded-lg overflow-hidden">
            <VideoRecorderNew
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
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/" className="hover:underline">
              {screenState === "update"
                ? "Restart Verification"
                : "Video Verification"}
            </a>
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
