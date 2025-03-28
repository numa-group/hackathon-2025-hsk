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
import { VerificationStatus, calculateVerificationStats } from "./status";
import { AnimatePresence, motion } from "motion/react";
import { LoadingOverlay } from "../loading-overlay";

const CardContentMotion = motion(CardContent);
export const VerificationScreen = ({
  title,
  description,
  checklistItems,
  onRecordClick,
  onContinueClick,
  isLoading = false,
  state = "initial",
}: VerificationScreenProps) => {
  // Calculate verification stats for determining if all items are verified
  const stats = useMemo(
    () => calculateVerificationStats(checklistItems),
    [checklistItems],
  );

  // Check if all items are verified
  const allVerified = useMemo(() => {
    return stats.verified === stats.total;
  }, [stats]);

  // If state is 'success' or (state is 'update' and all items are verified)
  const showSuccessState =
    state === "success" || (state === "update" && allVerified);

  return (
    <div className="container max-w-md mx-auto py-8">
      <LoadingOverlay isLoading={isLoading} />
      <Card className="gap-2">
        <CardHeader>
          <AnimatePresence mode="sync">
            <motion.div>
              {showSuccessState ? (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      scale: {
                        ease: "easeInOut",
                      },
                    },
                  }}
                  className="flex flex-col items-center justify-center py-6 transition-all duration-500 ease-in-out"
                >
                  {/* Success icon */}
                  <div className="bg-primary/10 p-6 rounded-full mb-4 transition-all duration-500 ease-in-out">
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </div>

                  {/* Success message */}
                  <p className="text-center text-primary font-medium mb-8 transition-opacity duration-500 ease-in-out">
                    All verification requirements have been met
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="transition-all duration-300 ease-in-out flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                  </div>

                  <VerificationStatus checklistItems={checklistItems} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardHeader>

        <CardContentMotion layout>
          <div className="transition-all duration-300 ease-in-out">
            <div className="max-h-[500px] overflow-auto scrollbar">
              <Checklist items={checklistItems} />
            </div>
          </div>
        </CardContentMotion>

        {!showSuccessState && (
          <CardFooter>
            <Button
              onClick={state === "initial" ? onRecordClick : onContinueClick}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center transition-all duration-300 ease-in-out">
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
              </div>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
