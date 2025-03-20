"use client";

import { useState } from "react";
import { VerificationScreen } from "./verification-screen";
import { Checklist } from "./checklist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { demoChecklistItems, checklistVariants } from "./constants";

export default function ComponentsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setSelectedComponent] = useState("checklist");
  const [checklistVariant, setChecklistVariant] = useState("mixed");
  
  const handleRecordClick = () => {
    setIsLoading(true);
    // Simulate loading state for demo purposes
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Components</h1>
      <p className="text-lg mb-8">This page showcases our components in isolation.</p>
      
      <Tabs 
        defaultValue="checklist" 
        className="w-full max-w-3xl"
        onValueChange={setSelectedComponent}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="verification">Verification Screen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checklist" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Checklist Component</h2>
            <Select value={checklistVariant} onValueChange={setChecklistVariant}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allVerified">All Verified</SelectItem>
                <SelectItem value="mixed">Mixed Status</SelectItem>
                <SelectItem value="noneVerified">None Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Checklist Variant: {checklistVariant}</CardTitle>
              <CardDescription>
                {checklistVariant === "allVerified" && "All items are verified"}
                {checklistVariant === "mixed" && "Items have mixed verification statuses"}
                {checklistVariant === "noneVerified" && "No items are verified"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Checklist 
                items={checklistVariants[checklistVariant as keyof typeof checklistVariants]} 
                title="Verification Checklist"
                description="The following items need to be verified through video recording"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Verification Screen</h2>
            <VerificationScreen
              title="Video Verification"
              description="Complete the verification process by recording a short video"
              checklistItems={demoChecklistItems}
              onRecordClick={handleRecordClick}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
