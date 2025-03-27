import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { ChecklistItem } from "../checklist/types";
import { cn } from "@/lib/utils";

interface VerificationStatusProps {
  className?: string;
  checklistItems: ChecklistItem[];
}

interface VerificationStats {
  total: number;
  verified: number;
  declined: number;
  unverified: number;
}

export const VerificationStatus = ({
  className,
  checklistItems,
}: VerificationStatusProps) => {
  // Calculate verification stats
  const stats = useMemo<VerificationStats>(() => {
    const total = checklistItems.length;
    const verified = checklistItems.filter(
      (item) => item.status === "verified",
    ).length;
    const declined = checklistItems.filter(
      (item) => item.status === "declined",
    ).length;
    const unverified = total - verified - declined;
    return { total, verified, declined, unverified };
  }, [checklistItems]);

  // Calculate progress percentage
  const progressPercentage = (stats.verified / stats.total) * 100;

  // Use Framer Motion's spring animation for smooth transitions
  const springConfig = { stiffness: 100, damping: 30, duration: 0.8 };
  const animatedProgress = useSpring(0, springConfig);

  // Update the spring value when progress changes
  useMemo(() => {
    animatedProgress.set(progressPercentage);
  }, [animatedProgress, progressPercentage]);

  return (
    <div className={cn("bg-card border rounded-lg p-3 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Verification Status</h3>
        <span className="text-xs text-muted-foreground">
          {stats.verified} of {stats.total} verified
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center bg-primary/5 rounded-md p-2">
          <div className="flex items-center mb-1">
            <CheckCircle2 className="h-4 w-4 text-primary mr-1" />
            <span className="text-xs font-medium">Verified</span>
          </div>
          <span className="text-lg font-bold">{stats.verified}</span>
        </div>

        <div className="flex flex-col items-center bg-amber-500/5 rounded-md p-2">
          <div className="flex items-center mb-1">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <span className="text-lg font-bold">{stats.unverified}</span>
        </div>

        <div className="flex flex-col items-center bg-destructive/5 rounded-md p-2">
          <div className="flex items-center mb-1">
            <XCircle className="h-4 w-4 text-destructive mr-1" />
            <span className="text-xs font-medium">Declined</span>
          </div>
          <span className="text-lg font-bold">{stats.declined}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          style={{
            width: useTransform(animatedProgress, (value) => `${value}%`),
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Export the stats calculation function for reuse
export const calculateVerificationStats = (
  checklistItems: ChecklistItem[],
): VerificationStats => {
  const total = checklistItems.length;
  const verified = checklistItems.filter(
    (item) => item.status === "verified",
  ).length;
  const declined = checklistItems.filter(
    (item) => item.status === "declined",
  ).length;
  const unverified = total - verified - declined;
  return { total, verified, declined, unverified };
};
