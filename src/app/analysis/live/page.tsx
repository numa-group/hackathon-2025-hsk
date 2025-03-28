"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoRecorderNew } from "@/app/components/video-recorder-new";
import { ObservationModal } from "@/app/components/observation-modal";
import {
  processVideoAnalysis,
  AnalysisObservation,
  VideoAnalysis,
} from "../actions";

export default function LiveAnalysisPage() {
  const [isRecording, setIsRecording] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "info" | "success" | "error";
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] =
    useState<AnalysisObservation | null>(null);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(0);

  const handleRecordingDone = async (videoData: {
    blob: Blob;
    mimeType: string;
    url: string;
  }) => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Create a File object from the Blob
      const file = new File(
        [videoData.blob],
        `live-recording-${Date.now()}.webm`,
        {
          type: videoData.mimeType,
        },
      );

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
          videoUrl: localVideoUrl,
        };

        setAnalysis(localAnalysis);
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
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Live Analysis</h1>
          <p className="text-xs text-muted-foreground">
            Recordings stored locally
          </p>
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
                "bg-primary/10 text-primary border-primary/20",
            )}
          >
            {statusMessage.text}
          </motion.div>
        )}

        {isRecording ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoRecorderNew
                hideCancel
                onDone={handleRecordingDone}
                onCancel={handleCancelRecording}
                width="100%"
                height="auto"
              />
            </CardContent>
          </Card>
        ) : isProcessing ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Processing</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground">
                  This may take a few minutes...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg flex items-center justify-center relative w-full h-full mx-auto">
                  <video
                    src={analysis.videoUrl}
                    className="w-full h-auto rounded-lg"
                    controls
                    playsInline
                    muted
                    autoPlay
                    loop
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                  {analysis.aiObservations.map(
                    (observation: AnalysisObservation) => (
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
                          observation.sentiment === "negative" && "shadow-sm",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <p>{observation.description}</p>
                          {observation.timestamp && (
                            <button
                              onClick={() => {
                                setSelectedObservation(observation);
                                setCurrentObservationIndex(
                                  analysis.aiObservations.indexOf(observation),
                                );
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
                    ),
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Record Your Property</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoRecorderNew
                onDone={handleRecordingDone}
                onCancel={handleCancelRecording}
                width="100%"
                height="auto"
              />
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
            const nextIndex =
              (currentObservationIndex + 1) % observations.length;
            setCurrentObservationIndex(nextIndex);
            setSelectedObservation(observations[nextIndex]);
          }}
          onPrevious={() => {
            if (!analysis) return;
            const observations = analysis.aiObservations;
            const prevIndex =
              (currentObservationIndex - 1 + observations.length) %
              observations.length;
            setCurrentObservationIndex(prevIndex);
            setSelectedObservation(observations[prevIndex]);
          }}
        />
      )}
    </div>
  );
}
