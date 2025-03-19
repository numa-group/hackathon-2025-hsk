"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistStory } from "./components/checklist-story";
import { VerificationResultStory } from "./components/verification-result-story";
import { VideoRecorderStory } from "./components/video-recorder-story";

export default function StoryboardPage() {
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Component Storyboard</h1>
        <p className="text-muted-foreground mt-2">
          A showcase of UI components used in the verification flow
        </p>
      </div>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="verification-result">Verification Result</TabsTrigger>
          <TabsTrigger value="video-recorder">Video Recorder</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="checklist" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Checklist Component</CardTitle>
                <CardDescription>
                  Displays a list of items with different verification statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChecklistStory />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification-result" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Verification Result Component</CardTitle>
                <CardDescription>
                  Shows the results of a verification process with progress indicator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VerificationResultStory />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="video-recorder" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Video Recorder Component</CardTitle>
                <CardDescription>
                  Camera interface for recording verification videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoRecorderStory />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
