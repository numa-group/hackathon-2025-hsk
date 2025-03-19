"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { VideoRecorder } from "./components/video-recorder";
import { VerificationResult } from "./components/verification-result";
import { ChecklistItem } from "./components/checklist/types";

export default function VerifyPage() {
  const [verificationResults, setVerificationResults] = useState<{
    items: ChecklistItem[];
  } | null>(null);

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
    setVerificationResults(results);
    setChecklist(results.items);
  };

  const handleReset = () => {
    setVerificationResults(null);
    setChecklist(initialChecklist);
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl font-bold">Room Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a video of the room to verify housekeeping standards
        </p>
      </motion.div>

      {verificationResults ? (
        <VerificationResult items={checklist} onReset={handleReset} />
      ) : (
        <div className="space-y-8">
          <VideoRecorder onVideoProcessed={handleVideoProcessed} />

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Verification Checklist</h2>
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
