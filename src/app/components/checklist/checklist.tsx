import { cn } from "@/lib/utils";
import { ChecklistProps } from "./types";
import { CheckCircle, XCircle, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";

export const Checklist = ({ items }: ChecklistProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <CheckCircle className="h-5 w-5 text-primary transition-colors duration-500" />
        );
      case "declined":
        return (
          <XCircle className="h-5 w-5 text-destructive transition-colors duration-500" />
        );
      default:
        return (
          <Circle className="h-5 w-5 text-muted-foreground transition-colors duration-500" />
        );
    }
  };

  const getItemClassName = (status: string) => {
    return cn(
      "flex items-start gap-3 p-4 rounded-lg border transition-colors duration-500",
      status === "verified" && "bg-primary/10 border-primary",
      status === "declined" && "bg-destructive/10 border-destructive",
      status === "unverified" && "bg-muted border-border",
    );
  };

  // Sort items by status: unverified, declined, verified
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const statusOrder = { unverified: 0, declined: 1, verified: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [items]);

  return (
    <div className="w-full">
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {sortedItems.map((item) => (
            <motion.div
              key={item.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.5,
                opacity: { duration: 0.3 },
              }}
              className={getItemClassName(item.status)}
            >
              <motion.div
                className="mt-0.5"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "tween",
                  ease: "easeInOut",
                  duration: 0.4,
                }}
              >
                {getStatusIcon(item.status)}
              </motion.div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
