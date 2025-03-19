"use client";

import { useState } from "react";
import { VideoRecorder } from "./components/video-recorder";
import { VerificationResult } from "./components/verification-result";
import { ChecklistItem } from "./components/checklist/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera } from "lucide-react";

// Define the steps of the verification flow
type VerificationStep = 
  | "initial"       // Initial checklist view
  | "recording"     // Recording video
  | "processing"    // Processing the video
  | "results"       // Showing verification results
  | "completed";    // Verification completed (100%)

export default function VerifyPage() {
  // Current step in the verification flow
  const [currentStep, setCurrentStep] = useState<VerificationStep>("initial");
  
  // Processing state for tracking video processing
  const [isProcessing, setIsProcessing] = useState(false);

  const initialChecklist: ChecklistItem[] = [
    {
      id: "1",
      description: "TV remote placed on bedside table",
      status: "pending",
    },
    { id: "2", description: "Welcome card on bed", status: "pending" },
    { id: "3", description: "Fresh towels in bathroom", status: "pending" },
    { id: "4", description: "Minibar stocked", status: "pending" },
    { id: "5", description: "Bed properly made", status: "pending" },
  ];

  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

  const handleVideoProcessed = (results: { items: ChecklistItem[] }) => {
    setChecklist(results.items);
    
    // Check if all items are verified
    const allVerified = results.items.every(item => item.status === "verified");
    setCurrentStep(allVerified ? "completed" : "results");
  };

  const handleStartRecording = () => {
    setCurrentStep("recording");
  };

  const handleCancelRecording = () => {
    setCurrentStep("initial");
  };

  const handleContinueVerification = () => {
    setCurrentStep("recording");
  };

  const handleVideoSubmitted = () => {
    setCurrentStep("processing");
    setIsProcessing(true);
  };

  const isFullyVerified = checklist.every(item => item.status === "verified");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-6 text-center">
        <h1 className="text-2xl font-bold">Room Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a video of the room to verify housekeeping standards
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {currentStep === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-lg font-medium">Processing video...</p>
            <p className="text-sm text-muted-foreground">This will take a few seconds</p>
          </div>
        )}

        {(currentStep === "results" || currentStep === "completed") && (
          <div className="flex-1 flex flex-col px-4">
            {isFullyVerified && (
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mt-4">Perfect! All Items Verified</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The room meets all housekeeping standards
                </p>
              </div>
            )}
            <VerificationResult 
              items={checklist} 
              onContinue={handleContinueVerification}
              isCompleted={currentStep === "completed"}
            />
          </div>
        )}

        {currentStep === "recording" && (
          <div className="flex-1 flex flex-col">
            <VideoRecorder 
              onVideoProcessed={handleVideoProcessed} 
              onCancel={handleCancelRecording}
              onSubmit={handleVideoSubmitted}
            />
          </div>
        )}

        {currentStep === "initial" && (
          <div className="flex-1 flex flex-col px-4">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center space-y-8 py-4">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-center">Verification Checklist</h2>
                  <ul className="space-y-3">
                    {checklist.map((item) => (
                      <li
                        key={item.id}
                        className="p-3 rounded-lg border bg-card flex items-center gap-3"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-sm">{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="py-6">
                <Button 
                  onClick={handleStartRecording} 
                  size="lg"
                  className="w-full h-12 text-base gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Recording
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
