"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [, setIsProcessing] = useState(false);

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
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
  };

  const isFullyVerified = checklist.every(item => item.status === "verified");

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-6 text-center"
      >
        <h1 className="text-2xl font-bold">Room Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a video of the room to verify housekeeping standards
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {currentStep === "processing" && (
          <motion.div
            key="processing"
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="mt-4 text-lg font-medium">Processing video...</p>
            <p className="text-sm text-muted-foreground">This will take a few seconds</p>
          </motion.div>
        )}

        {(currentStep === "results" || currentStep === "completed") && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col px-4"
          >
            {isFullyVerified && (
              <motion.div 
                className="text-center mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.div
                  className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </motion.div>
                <h2 className="text-xl font-bold mt-4">Perfect! All Items Verified</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The room meets all housekeeping standards
                </p>
              </motion.div>
            )}
            <VerificationResult 
              items={checklist} 
              onContinue={handleContinueVerification}
              isCompleted={currentStep === "completed"}
            />
          </motion.div>
        )}

        {currentStep === "recording" && (
          <motion.div
            key="recorder"
            className="flex-1 flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <VideoRecorder 
              onVideoProcessed={handleVideoProcessed} 
              onCancel={handleCancelRecording}
              onSubmit={handleVideoSubmitted}
            />
          </motion.div>
        )}

        {currentStep === "initial" && (
          <motion.div
            key="checklist"
            className="flex-1 flex flex-col px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center space-y-8 py-4">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-center">Verification Checklist</h2>
                  <ul className="space-y-3">
                    {checklist.map((item, index) => (
                      <motion.li
                        key={item.id}
                        className="p-3 rounded-lg border bg-card flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-sm">{item.description}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="py-6">
                <Button 
                  onClick={handleStartRecording} 
                  size="lg"
                  className="w-full h-14 text-base gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Recording
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
