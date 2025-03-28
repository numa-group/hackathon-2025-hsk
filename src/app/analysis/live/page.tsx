"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { VideoRecorderNew } from "@/app/components/video-recorder-new";
import { ObservationModal } from "@/app/components/observation-modal";
import {
  processVideoAnalysis,
  AnalysisObservation,
  VideoAnalysis,
} from "../actions";

export default function LiveAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "info" | "success" | "error";
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<AnalysisObservation | null>(null);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(0);

  const handleStartRecording = () => {
    setIsRecording(true);
    setStatusMessage({
      text: "Recording started. Click 'Stop Recording' when finished.",
      type: "info",
    });
  };

  const handleRecordingDone = async (videoData: {
    blob: Blob;
    mimeType: string;
    url: string;
  }) => {
    setIsRecording(false);
    setIsProcessing(true);
    setStatusMessage({
      text: "Processing video... This may take a few minutes.",
      type: "info",
    });

    try {
      // Create a File object from the Blob
      const file = new File([videoData.blob], `live-recording-${Date.now()}.webm`, {
        type: videoData.mimeType,
      });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("video", file);

      // Process the video
      const result = await processVideoAnalysis(formData);

      if (result.success && result.analysis) {
        // Store the video URL locally instead of using the server path
        const localVideoUrl = videoData.url;
        
        // Create a modified analysis object with the local URL
        const localAnalysis = {
          ...result.analysis,
          videoUrl: localVideoUrl
        };
        
        setAnalysis(localAnalysis);
        setStatusMessage({
          text: "Video processed successfully!",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: `Error: ${result.message}`,
          type: "error",
        });
      }
    } catch (error) {
      setStatusMessage({
        text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setStatusMessage(null);
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Live Video Analysis</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Note: Recordings are stored locally in your browser and will not be saved when you leave this page.
            </p>
          </div>

          {!isRecording && !isProcessing && (
            <Button onClick={handleStartRecording}>Start Recording</Button>
          )}
        </div>

        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg text-sm font-medium border",
              statusMessage.type === "error" &&
                "bg-destructive/15 text-destructive border-destructive/30",
              statusMessage.type === "success" &&
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30",
              statusMessage.type === "info" &&
                "bg-primary/10 text-primary border-primary/20"
            )}
          >
            {statusMessage.text}
          </motion.div>
        )}

        {isRecording ? (
          <Card>
            <CardHeader>
              <CardTitle>Recording</CardTitle>
              <CardDescription>Record your property inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoRecorderNew
                onDone={handleRecordingDone}
                onCancel={handleCancelRecording}
                width="100%"
                height="500px"
              />
            </CardContent>
          </Card>
        ) : isProcessing ? (
          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
              <CardDescription>Analyzing your video</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground">This may take a few minutes...</p>
              </div>
            </CardContent>
          </Card>
        ) : analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
                <CardDescription>Recorded inspection footage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center relative overflow-hidden h-[500px] aspect-[9/16] mx-auto">
                  <video
                    src={analysis.videoUrl}
                    className="h-full w-full rounded-lg object-contain"
                    controls
                    playsInline
                    autoPlay
                    loop
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Observations</CardTitle>
                <CardDescription>Analysis of the property condition</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                  {analysis.aiObservations.map((observation: AnalysisObservation) => (
                    <motion.div
                      key={observation.id}
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "mb-2 p-3 rounded-lg",
                        observation.sentiment === "positive" &&
                          "bg-primary/10 border-l-4 border-primary",
                        observation.sentiment === "negative" &&
                          "bg-destructive/15 border-l-4 border-destructive font-medium",
                        observation.sentiment === "negative" && "shadow-sm"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <p>{observation.description}</p>
                        {observation.timestamp && (
                          <button
                            onClick={() => {
                              setSelectedObservation(observation);
                              setCurrentObservationIndex(analysis.aiObservations.indexOf(observation));
                              setIsModalOpen(true);
                            }}
                            className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                          >
                            {observation.timestamp || "N/A"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {observation.type}
                      </p>
                    </motion.div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Record</CardTitle>
              <CardDescription>
                Click the "Start Recording" button to begin your property inspection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[500px] bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
                    <rect x="3" y="6" width="12" height="12" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No Recording Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Record a video of your property inspection and our AI will analyze it for
                  cleanliness and maintenance observations.
                </p>
                <Button onClick={handleStartRecording} className="mt-4">
                  Start Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Observation Modal */}
      {analysis && (
        <ObservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          observation={selectedObservation}
          videoUrl={analysis.videoUrl}
          observations={analysis.aiObservations}
          currentIndex={currentObservationIndex}
          onNext={() => {
            if (!analysis) return;
            const observations = analysis.aiObservations;
            const nextIndex = (currentObservationIndex + 1) % observations.length;
            setCurrentObservationIndex(nextIndex);
            setSelectedObservation(observations[nextIndex]);
          }}
          onPrevious={() => {
            if (!analysis) return;
            const observations = analysis.aiObservations;
            const prevIndex = (currentObservationIndex - 1 + observations.length) % observations.length;
            setCurrentObservationIndex(prevIndex);
            setSelectedObservation(observations[prevIndex]);
          }}
        />
      )}
    </div>
  );
}
