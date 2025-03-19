"use client";

import { motion } from "motion/react";
import { ChecklistItem, VerificationStatus } from "./types";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Circle } from "lucide-react";

interface ChecklistProps {
  items: ChecklistItem[];
}

export const Checklist = ({ items }: ChecklistProps) => {
  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
          </motion.div>
        );
      case "unverified":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </motion.div>
        );
      case "declined":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <XCircle className="h-5 w-5 text-red-500" />
          </motion.div>
        );
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "unverified":
        return "Couldn't Verify";
      case "declined":
        return "Not Present";
      default:
        return "Pending";
    }
  };

  const getStatusClass = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return "text-green-500 bg-green-50 dark:bg-green-950/30";
      case "unverified":
        return "text-amber-500 bg-amber-50 dark:bg-amber-950/30";
      case "declined":
        return "text-red-500 bg-red-50 dark:bg-red-950/30";
      default:
        return "text-muted-foreground bg-muted/50";
    }
  };

  return (
    <motion.div
      className="w-full space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-center">Verification Results</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            className="p-4 rounded-lg border bg-card shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getStatusIcon(item.status)}</div>
              <div className="flex-1">
                <p className="font-medium">{item.description}</p>
                <div className="mt-2">
                  <motion.span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full inline-block font-medium",
                      getStatusClass(item.status),
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {getStatusText(item.status)}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};
