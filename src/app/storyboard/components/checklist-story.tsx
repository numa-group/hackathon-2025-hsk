"use client";

import { useState } from "react";
import { Checklist } from "@/app/verify/components/checklist";
import { ChecklistItem, VerificationStatus } from "@/app/verify/components/checklist/types";
import { Button } from "@/components/ui/button";

export const ChecklistStory = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", description: "TV remote placed on bedside table", status: "verified" },
    { id: "2", description: "Welcome card on bed", status: "unverified" },
    { id: "3", description: "Fresh towels in bathroom", status: "declined" },
    { id: "4", description: "Minibar stocked", status: "pending" },
    { id: "5", description: "Bed properly made", status: "verified" },
  ]);

  const generateRandomStatus = (): VerificationStatus => {
    const statuses: VerificationStatus[] = ["pending", "verified", "unverified", "declined"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const generateRandomText = (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    return Array(length).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleRandomize = () => {
    const randomItems: ChecklistItem[] = Array(5).fill(0).map((_, index) => ({
      id: (index + 1).toString(),
      description: generateRandomText(Math.floor(Math.random() * 30) + 20),
      status: generateRandomStatus(),
    }));
    setItems(randomItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleRandomize}>Randomize Items</Button>
      </div>
      <div className="border rounded-lg p-4 bg-background max-w-3xl mx-auto">
        <Checklist items={items} />
      </div>
    </div>
  );
};
