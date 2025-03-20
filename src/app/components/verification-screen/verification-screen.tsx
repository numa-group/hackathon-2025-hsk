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
        <motion.div>
          <AnimatePresence>
            <motion.div
              key={
                showSuccessState
                  ? "success-header"
                  : `verification-header-${state}`
              }
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                y: { type: "spring", stiffness: 300, damping: 25 },
              }}
            >
              <CardHeader>
                {showSuccessState ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.8, // Appear after checklist moves down
                      duration: 0.4,
                    }}
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
        </motion.div>

        <CardContent>
          <AnimatePresence>
            {showSuccessState && (
              <motion.div className="flex flex-col items-center justify-center py-6">
                {/* Success icon */}
                <motion.div
                  className="bg-green-900/20 p-6 rounded-full mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.0, // Appear after header
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </motion.div>

                {/* Success message */}
                <motion.p
                  className="text-center text-green-500 font-medium mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  All verification requirements have been met
                </motion.p>
              </motion.div>
            )}

            <motion.div
              layoutId="checklist-content"
              transition={{
                layout: { ease: "easeInOut", duration: 1 },
              }}
            >
              <Checklist items={checklistItems} />
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <AnimatePresence>
          {!showSuccessState && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                y: { type: "spring", stiffness: 300, damping: 25 },
              }}
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
                  <AnimatePresence>
                    <motion.div
                      key={state === "initial" ? "record" : "continue"}
                      className="flex items-center justify-center"
                      initial={{
                        opacity: 0,
                        y: -20,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: 20,
                      }}
                      transition={{
                        duration: 0.3,
                        y: { ease: "easeOut", duration: 0.5 },
                      }}
                    >
                      {state === "initial" ? (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Record Verification Video
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Continue Verification
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
