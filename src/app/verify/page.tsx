"use client";
import { useState } from "react";
import {
  VerificationScreen,
  VerificationScreenState,
} from "../components/verification-screen";
import { VideoRecorder, RecordedVideoData } from "../components/video-recorder";
import { ChecklistItem, ChecklistItemStatus } from "../components/checklist";

// Mock data - initial checklist items
const initialChecklistItems: ChecklistItem[] = [
  {
    id: "1",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "2",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "3",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "4",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "5",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "6",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  {
    id: "7",
    title: "Face Verification",
    description: "Record a clear video of your face",
    status: "unverified",
  },
  {
    id: "8",
    title: "Proof of Address",
    description: "Show a utility bill or bank statement with your address",
    status: "unverified",
  },
];

// Dummy API function to simulate video processing
const processVideo = async (
  videoData: RecordedVideoData,
  currentItems: ChecklistItem[],
  attemptCount: number,
): Promise<ChecklistItem[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Clone the current items to avoid mutating the original
  const updatedItems = [...currentItems];

  if (attemptCount === 1) {
    // First attempt: Verify the first item, decline the second
    updatedItems[0].status = "verified";
    updatedItems[1].status = "declined";
  } else if (attemptCount === 2) {
    // Second attempt: Verify the first two items
    updatedItems[0].status = "verified";
    updatedItems[1].status = "verified";
  } else {
    // Third attempt: Verify all items
    updatedItems.forEach((item) => {
      item.status = "verified";
    });
  }

  return updatedItems;
};

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
      // Process the video with our dummy API
      const updatedItems = await processVideo(
        videoData,
        checklistItems,
        newAttemptCount,
      );
      setChecklistItems(updatedItems);

      // Check if all items are verified
      if (areAllItemsVerified(updatedItems)) {
        setScreenState("success");
      } else {
        setScreenState("update");
      }
    } catch (error) {
      console.error("Error processing video:", error);
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
              ? "Review your verification status and continue if needed"
              : "Complete the verification process by recording a short video"
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
