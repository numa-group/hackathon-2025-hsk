import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checklist } from "../checklist";
import { VerificationScreenProps } from "./types";
import { Video } from "lucide-react";

export const VerificationScreen = ({
  title,
  description,
  checklistItems,
  onRecordClick,
  isLoading = false,
}: VerificationScreenProps) => {
  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
        
        <CardContent>
          <Checklist items={checklistItems} />
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onRecordClick} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            <Video className="mr-2 h-4 w-4" />
            {isLoading ? "Processing..." : "Record Verification Video"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
