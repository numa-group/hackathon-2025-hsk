"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Checklist } from "../checklist";
import { VerificationResultProps } from "./types";
import { RefreshCw } from "lucide-react";

export const VerificationResult = ({
  items,
  onReset,
}: VerificationResultProps) => {
  const verifiedCount = items.filter(
    (item) => item.status === "verified",
  ).length;
  const totalCount = items.length;
  const percentage = Math.round((verifiedCount / totalCount) * 100);

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <span className="text-3xl font-bold text-primary">{percentage}%</span>
        </motion.div>
        <h2 className="mt-4 text-xl font-semibold">Verification Complete</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {verifiedCount} of {totalCount} items verified
        </p>
      </div>

      <Checklist items={items} />

      <Button onClick={onReset} variant="outline" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Verify Another Room
      </Button>
    </motion.div>
  );
};
