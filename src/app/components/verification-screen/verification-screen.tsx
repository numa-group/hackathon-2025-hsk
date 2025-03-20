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
        <CardHeader>
          <div className="transition-all duration-300 ease-in-out">
            {showSuccessState ? (
              <div className="transition-opacity duration-500 ease-in-out">
                <h2 className="text-2xl font-bold text-green-500">
                  Verification Complete
                </h2>
                <p className="text-muted-foreground">{successMessage}</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {showSuccessState && (
            <div className="flex flex-col items-center justify-center py-6 transition-all duration-500 ease-in-out">
              {/* Success icon */}
              <div className="bg-green-900/20 p-6 rounded-full mb-4 transition-all duration-500 ease-in-out">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>

              {/* Success message */}
              <p className="text-center text-green-500 font-medium mb-8 transition-opacity duration-500 ease-in-out">
                All verification requirements have been met
              </p>
            </div>
          )}

          <div className="transition-all duration-300 ease-in-out">
            <Checklist items={checklistItems} />
          </div>
        </CardContent>

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
