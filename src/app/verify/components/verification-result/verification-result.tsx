"use client";

import { Button } from "@/components/ui/button";
import { Checklist } from "../checklist";
import { VerificationResultProps } from "./types";
import { Camera } from "lucide-react";

export const VerificationResult = ({
  items,
  onContinue,
  isCompleted
}: VerificationResultProps) => {
  const verifiedCount = items.filter(
    (item) => item.status === "verified",
  ).length;
  const totalCount = items.length;
  const percentage = Math.round((verifiedCount / totalCount) * 100);
  const isFullyVerified = percentage === 100;

  return (
    <div className="w-full flex-1 flex flex-col">
      {!isFullyVerified && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
            <span className="text-3xl font-bold text-primary">{percentage}%</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Verification Progress</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {verifiedCount} of {totalCount} items verified
          </p>
        </div>
      )}

      <div className="flex-1">
        <Checklist items={items} />
      </div>

      {!isCompleted && (
        <div className="py-6">
          <Button 
            onClick={onContinue} 
            variant="outline" 
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            <Camera className="h-5 w-5" />
            Continue with Verification
          </Button>
        </div>
      )}
    </div>
  );
};
