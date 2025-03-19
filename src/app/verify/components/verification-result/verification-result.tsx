"use client";

import { motion } from "motion/react";
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
    <motion.div
      className="w-full flex-1 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!isFullyVerified && (
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <span className="text-3xl font-bold text-primary">{percentage}%</span>
          </motion.div>
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
            className="w-full h-14 text-base gap-2"
            size="lg"
          >
            <Camera className="h-5 w-5" />
            Continue with Verification
          </Button>
        </div>
      )}
    </motion.div>
  );
};
