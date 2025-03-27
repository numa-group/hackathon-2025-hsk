"use client";

import { useState, useCallback } from "react";
import {
  VerificationScreen,
  VerificationScreenState,
} from "./verification-screen";
import { Checklist, ChecklistItem } from "./checklist";
import { VideoRecorder, RecordedVideoData } from "./video-recorder";
import { VideoRecorderNew, RecordedVideoDataNew } from "./video-recorder-new";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { demoChecklistItems, checklistVariants } from "./constants";

// New Video Recorder Demo Component
const VideoRecorderNewDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideoDataNew | null>(
    null,
  );
  const [maxDuration, setMaxDuration] = useState(30);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleVideoRecorded = (videoData: RecordedVideoDataNew) => {
    console.log("Video recorded with new recorder:", videoData);
    setRecordedVideo(videoData);
    setIsRecording(false);
  };

  const handleCancel = () => {
    console.log("Recording cancelled");
    setIsRecording(false);
  };

  const handleDurationChange = (value: string) => {
    setMaxDuration(parseInt(value, 10));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          {!isRecording ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={maxDuration.toString()}
                    onValueChange={handleDurationChange}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sec</SelectItem>
                      <SelectItem value="30">30 sec</SelectItem>
                      <SelectItem value="60">60 sec</SelectItem>
                      <SelectItem value="120">2 min</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    Max duration
                  </span>
                </div>
              </div>

              <Button onClick={handleStartRecording}>Start Recording</Button>

              {recordedVideo && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Last Recorded Video</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {recordedVideo.duration} seconds
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {recordedVideo.mimeType}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span>{" "}
                      {Math.round(recordedVideo.file.size / 1024)} KB
                    </p>
                    <div className="mt-4">
                      <video
                        src={recordedVideo.url}
                        controls
                        className="w-full h-auto rounded-md"
                        playsInline
                        autoPlay={true}
                        muted={false}
                        key={recordedVideo.url}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setRecordedVideo(null)}
                    >
                      Record Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-black rounded-lg overflow-hidden">
              <VideoRecorderNew
                onDone={handleVideoRecorded}
                onCancel={handleCancel}
                maxDuration={maxDuration}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Video Recorder Demo Component
const VideoRecorderDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideoData | null>(
    null,
  );
  const [maxDuration, setMaxDuration] = useState(30);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleVideoRecorded = (videoData: RecordedVideoData) => {
    console.log("Video recorded:", videoData);
    setRecordedVideo(videoData);
    setIsRecording(false);
  };

  const handleCancel = () => {
    console.log("Recording cancelled");
    setIsRecording(false);
  };

  const handleDurationChange = (value: string) => {
    setMaxDuration(parseInt(value, 10));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          {!isRecording ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={maxDuration.toString()}
                    onValueChange={handleDurationChange}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sec</SelectItem>
                      <SelectItem value="30">30 sec</SelectItem>
                      <SelectItem value="60">60 sec</SelectItem>
                      <SelectItem value="120">2 min</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    Max duration
                  </span>
                </div>
              </div>

              <Button onClick={handleStartRecording}>Start Recording</Button>

              {recordedVideo && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Last Recorded Video</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {recordedVideo.duration} seconds
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {recordedVideo.mimeType}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span>{" "}
                      {Math.round(recordedVideo.file.size / 1024)} KB
                    </p>
                    <div className="mt-4">
                      <video
                        src={recordedVideo.url}
                        controls
                        className="w-full h-auto rounded-md"
                        playsInline
                        autoPlay={true}
                        muted={false}
                        key={recordedVideo.url} // Add key to force re-render when URL changes
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setRecordedVideo(null)}
                    >
                      Record Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-black rounded-lg overflow-hidden">
              <VideoRecorder
                onDone={handleVideoRecorded}
                onCancel={handleCancel}
                maxDuration={maxDuration}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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
      setItems((prev) =>
        prev.map((item, index) =>
          index < 2 ? { ...item, status: "verified" } : item,
        ),
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
      setItems((prev) => prev.map((item) => ({ ...item, status: "verified" })));
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
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {state}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
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
      />
    </div>
  );
};

export default function ComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState("checklist");
  const [checklistVariant, setChecklistVariant] = useState("mixed");
  const [items, setItems] = useState<ChecklistItem[]>(
    checklistVariants[checklistVariant as keyof typeof checklistVariants],
  );

  // Update items when variant changes
  const handleVariantChange = (value: string) => {
    setChecklistVariant(value);
    setItems(checklistVariants[value as keyof typeof checklistVariants]);
  };

  // Cycle through statuses: unverified -> verified -> declined -> unverified
  const cycleItemStatus = useCallback((title: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.title === title) {
          const statusMap: Record<string, ChecklistItem["status"]> = {
            unverified: "verified",
            verified: "declined",
            declined: "unverified",
          };
          return { ...item, status: statusMap[item.status] };
        }
        return item;
      }),
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">Components</h1>
      <p className="text-muted-foreground mb-8">
        Interactive showcase of our application components
      </p>

      <Tabs
        defaultValue="checklist"
        className="w-full max-w-3xl"
        onValueChange={setSelectedComponent}
        value={selectedComponent}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="verification">Verification Screen</TabsTrigger>
          <TabsTrigger value="video-recorder">Video Recorder</TabsTrigger>
          <TabsTrigger value="video-recorder-new">New Video Recorder</TabsTrigger>
        </TabsList>

        <TabsContent
          value="checklist"
          className="space-y-6 w-full max-w-md mx-auto"
        >
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Checklist</CardTitle>
                <CardDescription>
                  Verification status indicators
                </CardDescription>
              </div>
              <Select
                value={checklistVariant}
                onValueChange={handleVariantChange}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allVerified">All Verified</SelectItem>
                  <SelectItem value="mixed">Mixed Status</SelectItem>
                  <SelectItem value="noneVerified">None Verified</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent className="pt-6">
              <Checklist
                items={items}
                title="Verification Checklist"
                description="The following items need to be verified through video recording"
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                onClick={() => {
                  const nextItem = items.find(
                    (item) => item.status !== "verified",
                  );
                  if (nextItem) cycleItemStatus(nextItem.title);
                }}
                size="sm"
              >
                Cycle Next Status
              </Button>
            </CardFooter>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p>
              Tip: Click on any checklist item to cycle through its statuses
            </p>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="w-full max-w-md mx-auto">
          <Card className="w-full mb-4">
            <CardHeader className="pb-2">
              <CardTitle>Verification Screen</CardTitle>
              <CardDescription>Multi-step verification process</CardDescription>
            </CardHeader>
          </Card>

          <VerificationScreenDemo />
        </TabsContent>

        <TabsContent value="video-recorder" className="w-full max-w-md mx-auto">
          <Card className="w-full mb-4">
            <CardHeader className="pb-2">
              <CardTitle>Video Recorder</CardTitle>
              <CardDescription>Camera recording interface</CardDescription>
            </CardHeader>
          </Card>

          <VideoRecorderDemo />
        </TabsContent>

        <TabsContent value="video-recorder-new" className="w-full max-w-md mx-auto">
          <Card className="w-full mb-4">
            <CardHeader className="pb-2">
              <CardTitle>New Video Recorder</CardTitle>
              <CardDescription>Using react-record-webcam library</CardDescription>
            </CardHeader>
          </Card>

          <VideoRecorderNewDemo />
        </TabsContent>
      </Tabs>
    </main>
  );
}
