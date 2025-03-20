import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checklist } from "../checklist";
import { VerificationScreenProps } from "./types";
import { Video, ArrowRight, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

export const VerificationScreen = ({
  title,
  description,
  checklistItems,
  onRecordClick,
  onContinueClick,
  isLoading = false,
  state = "initial",
  successMessage = "Great job! All items have been successfully verified.",
}: VerificationScreenProps) => {
  // Check if all items are verified
  const allVerified = useMemo(() => {
    return checklistItems.every((item) => item.status === "verified");
  }, [checklistItems]);

  // If state is 'success' or (state is 'update' and all items are verified)
  const showSuccessState =
    state === "success" || (state === "update" && allVerified);

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <AnimatePresence mode="wait">
          <motion.div
            key={showSuccessState ? "success" : "verification"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader>
              {showSuccessState ? (
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <h2 className="text-2xl font-bold text-green-500">
                    Verification Complete
                  </h2>
                  <p className="text-muted-foreground">{successMessage}</p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{title}</h2>
                  <p className="text-muted-foreground">{description}</p>
                </>
              )}
            </CardHeader>
          </motion.div>
        </AnimatePresence>

        <CardContent>
          <AnimatePresence mode="wait">
            {showSuccessState ? (
              <motion.div
                key="success-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <motion.div
                  className="bg-green-900/20 p-6 rounded-full mb-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </motion.div>
                <motion.p
                  className="text-center text-green-500 font-medium mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  All verification requirements have been met
                </motion.p>

                {/* Show checklist in a more subtle way during success state */}
                <motion.div
                  className="w-full mt-4 opacity-70 scale-95"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Verified Items:
                  </h3>
                  <Checklist items={checklistItems} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="checklist-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Checklist items={checklistItems} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <AnimatePresence>
          {!showSuccessState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CardFooter>
                <Button
                  onClick={
                    state === "initial" ? onRecordClick : onContinueClick
                  }
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state === "initial" ? "record" : "continue"}
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {state === "initial" ? (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          {isLoading
                            ? "Processing..."
                            : "Record Verification Video"}
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          {isLoading
                            ? "Processing..."
                            : "Continue Verification"}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
