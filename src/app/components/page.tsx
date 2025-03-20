"use client";

import { useState, useCallback } from "react";
import { VerificationScreen, VerificationScreenState } from "./verification-screen";
import { Checklist, ChecklistItem } from "./checklist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { demoChecklistItems, checklistVariants } from "./constants";

// Verification Screen Demo Component
const VerificationScreenDemo = () => {
  const [state, setState] = useState<VerificationScreenState>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>(demoChecklistItems);
  
  // Handle record button click
  const handleRecordClick = () => {
    setIsLoading(true);
    
    // Simulate loading and transition to update state
    setTimeout(() => {
      setIsLoading(false);
      setState("update");
      // Update some items to verified status
      setItems(prev => 
        prev.map((item, index) => 
          index < 2 ? { ...item, status: "verified" } : item
        )
      );
    }, 1500);
  };
  
  // Handle continue button click
  const handleContinueClick = () => {
    setIsLoading(true);
    
    // Simulate loading and transition to success state
    setTimeout(() => {
      setIsLoading(false);
      // Mark all items as verified
      setItems(prev => 
        prev.map(item => ({ ...item, status: "verified" }))
      );
      setState("success");
    }, 1500);
  };
  
  // Reset demo
  const handleReset = () => {
    setState("initial");
    setItems(demoChecklistItems);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Current State: {state}</h3>
          <p className="text-sm text-muted-foreground">
            Watch the transitions between states
          </p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Reset Demo
        </Button>
      </div>
      
      <VerificationScreen
        title={
          state === "initial" 
            ? "Video Verification" 
            : state === "update" 
              ? "Continue Verification" 
              : "Verification Complete"
        }
        description={
          state === "initial"
            ? "Complete the verification process by recording a short video"
            : state === "update"
              ? "Review your verification status and continue the process"
              : "All items have been successfully verified"
        }
        checklistItems={items}
        onRecordClick={handleRecordClick}
        onContinueClick={handleContinueClick}
        isLoading={isLoading}
        state={state}
        successMessage="Congratulations! Your identity has been successfully verified."
      />
    </div>
  );
};

export default function ComponentsPage() {
  const [, setSelectedComponent] = useState("checklist");
  const [checklistVariant, setChecklistVariant] = useState("mixed");
  const [items, setItems] = useState<ChecklistItem[]>(
    checklistVariants[checklistVariant as keyof typeof checklistVariants]
  );

  // Update items when variant changes
  const handleVariantChange = (value: string) => {
    setChecklistVariant(value);
    setItems(checklistVariants[value as keyof typeof checklistVariants]);
  };

  // Cycle through statuses: unverified -> verified -> declined -> unverified
  const cycleItemStatus = useCallback((id: string) => {
    setItems(currentItems => 
      currentItems.map(item => {
        if (item.id === id) {
          const statusMap: Record<string, ChecklistItem['status']> = {
            'unverified': 'verified',
            'verified': 'declined',
            'declined': 'unverified'
          };
          return { ...item, status: statusMap[item.status] };
        }
        return item;
      })
    );
  }, []);

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
            <Select value={checklistVariant} onValueChange={handleVariantChange}>
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
                items={items} 
                title="Verification Checklist"
                description="The following items need to be verified through video recording"
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">Click on an item to cycle through statuses:</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <Button 
                    key={item.id} 
                    variant="outline" 
                    size="sm"
                    onClick={() => cycleItemStatus(item.id)}
                  >
                    Change &quot;{item.title}&quot; status
                  </Button>
                ))}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Verification Screen</h2>
            
            <VerificationScreenDemo />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
