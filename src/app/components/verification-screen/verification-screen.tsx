import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        {!showSuccessState && (
          <CardHeader>
            <div className="transition-all duration-300 ease-in-out">
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </CardHeader>
        )}

        <CardContent>
          {showSuccessState && (
            <div className="flex flex-col items-center justify-center py-6 transition-all duration-500 ease-in-out">
              {/* Success icon */}
              <div className="bg-primary/10 p-6 rounded-full mb-4 transition-all duration-500 ease-in-out">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>

              {/* Success message */}
              <p className="text-center text-primary font-medium mb-8 transition-opacity duration-500 ease-in-out">
                All verification requirements have been met
              </p>
            </div>
          )}

          <div className="transition-all duration-300 ease-in-out">
            <ScrollArea className="h-[500px]">
              <Checklist items={checklistItems} />
            </ScrollArea>
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
