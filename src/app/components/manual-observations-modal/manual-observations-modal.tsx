import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ManualObservationsModalProps } from "./types";
import { motion } from "framer-motion";

export function ManualObservationsModal({
  isOpen,
  onClose,
  observations,
}: ManualObservationsModalProps) {
  const getObservationClassName = (type: "positive" | "negative") => {
    return cn(
      "mb-2 p-3 rounded-lg",
      type === "positive" && "bg-primary/10 border-l-4 border-primary",
      type === "negative" && "bg-destructive/15 border-l-4 border-destructive font-medium",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manual Observations</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {observations.length > 0 ? (
            observations.map((observation) => (
              <motion.div
                key={observation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={getObservationClassName(observation.sentiment)}
              >
                <div className="flex justify-between items-start">
                  <p>{observation.description}</p>
                  {observation.timestamp && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                      {observation.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {observation.type}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm italic">
              No manual observations available
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
