"use client";

import { useState } from "react";
import { VerificationResult } from "@/app/verify/components/verification-result";
import { ChecklistItem } from "@/app/verify/components/checklist/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const VerificationResultStory = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", description: "TV remote placed on bedside table", status: "verified" },
    { id: "2", description: "Welcome card on bed", status: "verified" },
    { id: "3", description: "Fresh towels in bathroom", status: "unverified" },
    { id: "4", description: "Minibar stocked", status: "declined" },
    { id: "5", description: "Bed properly made", status: "verified" },
  ]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [allVerified, setAllVerified] = useState(false);

  const handleContinue = () => {
    alert("Continue button clicked");
  };

  const toggleAllVerified = () => {
    const newStatus = !allVerified;
    setAllVerified(newStatus);
    
    if (newStatus) {
      setItems(items.map(item => ({ ...item, status: "verified" })));
    } else {
      setItems([
        { id: "1", description: "TV remote placed on bedside table", status: "verified" },
        { id: "2", description: "Welcome card on bed", status: "verified" },
        { id: "3", description: "Fresh towels in bathroom", status: "unverified" },
        { id: "4", description: "Minibar stocked", status: "declined" },
        { id: "5", description: "Bed properly made", status: "verified" },
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      <div>
        <h3 className="text-lg font-medium mb-4">Component Preview</h3>
        <div className="border rounded-lg p-4 bg-background">
          <VerificationResult 
            items={items} 
            onContinue={handleContinue}
            isCompleted={isCompleted}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Controls</h3>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch 
              id="all-verified" 
              checked={allVerified}
              onCheckedChange={toggleAllVerified}
            />
            <Label htmlFor="all-verified">All items verified</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="completed" 
              checked={isCompleted}
              onCheckedChange={setIsCompleted}
            />
            <Label htmlFor="completed">Verification completed</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
