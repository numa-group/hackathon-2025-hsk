"use client";

import { useState, useRef, useEffect } from "react";
import { ObservationModal } from "../components/observation-modal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  processVideoAnalysis,
  loadAllAnalyses,
  VideoAnalysis,
  AnalysisObservation,
} from "./actions";
import { manualObservations } from "./manual-observations";

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] =
    useState<AnalysisObservation | null>(null);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedVideo = analyses.find((video) => video.id === selectedVideoId);

  // Get the base filename without extension to match with manual observations
  const getBaseFilename = (filename: string): string => {
    // Remove file extension if present
    return filename.replace(/\.[^/.]+$/, "");
  };

  // Load all analyses on component mount
  useEffect(() => {
    async function fetchAnalyses() {
      const allAnalyses = await loadAllAnalyses();

      // Apply manual observations to each analysis if available
      const updatedAnalyses = allAnalyses.map((analysis) => {
        const baseFilename = getBaseFilename(analysis.title);
        const matchingObservations = manualObservations[baseFilename] || [];

        return {
          ...analysis,
          manualObservations: matchingObservations,
        };
      });

      setAnalyses(updatedAnalyses);

      // Select the first video if available and none is selected
      if (updatedAnalyses.length > 0 && !selectedVideoId) {
        setSelectedVideoId(updatedAnalyses[0].id);
      }
    }

    fetchAnalyses();
  }, [selectedVideoId]);

  const handleVideoChange = (value: string) => {
    setSelectedVideoId(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      setUploadMessage("Please upload a video file");
      return;
    }

    // Check file size (limit to 100MB)
    if (file.size > 1024 * 1024 * 1024) {
      setUploadMessage("File size exceeds 100MB limit");
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadMessage("Uploading and analyzing video...");

    try {
      const formData = new FormData();
      formData.append("video", file);

      const result = await processVideoAnalysis(formData);

      if (result.success) {
        // Refresh the analyses list
        const updatedAnalyses = await loadAllAnalyses();
        setAnalyses(updatedAnalyses);

        // Select the newly uploaded video if available
        if (result.analysis) {
          setSelectedVideoId(result.analysis.id);
        }

        setUploadMessage("Video uploaded and analyzed successfully!");

        // Reset the form
        if (formRef.current) {
          formRef.current.reset();
        }
      } else {
        setUploadMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getObservationClassName = (type: AnalysisObservation["sentiment"]) => {
    return cn(
      "mb-2 p-3 rounded-lg",
      type === "positive" && "bg-primary/10 border-l-4 border-primary",
      type === "negative" && "bg-destructive/10 border-l-4 border-destructive",
    );
  };

  const handleTimestampClick = (
    observation: AnalysisObservation,
    index: number,
  ) => {
    setSelectedObservation(observation);
    setCurrentObservationIndex(index);
    setIsModalOpen(true);
  };

  const handleNextObservation = () => {
    if (!selectedVideo) return;

    const observations = selectedVideo.aiObservations;
    const nextIndex = (currentObservationIndex + 1) % observations.length;
    setCurrentObservationIndex(nextIndex);
    setSelectedObservation(observations[nextIndex]);
  };

  const handlePreviousObservation = () => {
    if (!selectedVideo) return;

    const observations = selectedVideo.aiObservations;
    const prevIndex =
      (currentObservationIndex - 1 + observations.length) % observations.length;
    setCurrentObservationIndex(prevIndex);
    setSelectedObservation(observations[prevIndex]);
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Video Analysis</h1>

          <div className="flex flex-col sm:flex-row gap-2">
            <form
              ref={formRef}
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (fileInputRef.current?.files?.length) {
                  handleUpload(fileInputRef.current.files[0]);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </form>

            <Select value={selectedVideoId} onValueChange={handleVideoChange}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select a video" />
              </SelectTrigger>
              <SelectContent>
                {analyses.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-3 rounded-lg text-sm",
              uploadMessage.includes("Error") ||
                uploadMessage.includes("failed")
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            {uploadMessage}
          </motion.div>
        )}

        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
                <CardDescription>Selected inspection footage</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    setSelectedObservation(null);
                    setIsModalOpen(true);
                  }}
                >
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full rounded-lg object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <div className="bg-black/60 rounded-full p-4 max-h-[600px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>
                  Comparison between manual and AI observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {selectedVideo.summary}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Responsive layout - side by side on desktop, tabbed on mobile */}
            <div className="w-full">
              {/* Desktop view (side by side) - hidden on mobile */}
              <div className="hidden lg:block">
                <Card>
                  <CardHeader>
                    <CardTitle>Observations Comparison</CardTitle>
                    <CardDescription>
                      Side-by-side comparison of manual and AI observations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Manual Observations
                        </h3>
                        <ScrollArea className="h-[350px] sm:h-[400px] pr-4">
                          {selectedVideo.manualObservations.length > 0 ? (
                            selectedVideo.manualObservations.map(
                              (observation) => (
                                <motion.div
                                  key={observation.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className={getObservationClassName(
                                    observation.sentiment,
                                  )}
                                >
                                  <div className="flex justify-between items-start">
                                    <p>{observation.description}</p>
                                    {observation.timestamp && (
                                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                                        {observation.timestamp}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {observation.type}
                                  </p>
                                </motion.div>
                              ),
                            )
                          ) : (
                            <p className="text-muted-foreground text-sm italic">
                              No manual observations available
                            </p>
                          )}
                        </ScrollArea>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          AI Observations
                        </h3>
                        <ScrollArea className="h-[350px] sm:h-[400px] pr-4">
                          {selectedVideo.aiObservations.map((observation) => (
                            <motion.div
                              key={observation.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={getObservationClassName(
                                observation.sentiment,
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <p>{observation.description}</p>
                                {observation.timestamp && (
                                  <button
                                    onClick={() =>
                                      handleTimestampClick(
                                        observation,
                                        selectedVideo.manualObservations.indexOf(
                                          observation,
                                        ),
                                      )
                                    }
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile view (tabbed) - hidden on desktop */}
            <div className="block lg:hidden">
              <Card className="mb-4">
                <CardHeader>
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manual">
                        Manual Observations
                      </TabsTrigger>
                      <TabsTrigger value="ai">AI Observations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="mt-4">
                      <ScrollArea className="h-[400px] px-2 pr-4">
                        {selectedVideo.manualObservations.length > 0 ? (
                          selectedVideo.manualObservations.map(
                            (observation) => (
                              <motion.div
                                key={observation.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={getObservationClassName(
                                  observation.sentiment,
                                )}
                              >
                                <div className="flex justify-between items-start">
                                  <p>{observation.description}</p>
                                  {observation.timestamp && (
                                    <button
                                      onClick={() =>
                                        handleTimestampClick(
                                          observation,
                                          selectedVideo.aiObservations.indexOf(
                                            observation,
                                          ),
                                        )
                                      }
                                      className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                                    >
                                      {observation.timestamp}
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {observation.type}
                                </p>
                              </motion.div>
                            ),
                          )
                        ) : (
                          <p className="text-muted-foreground text-sm italic">
                            No manual observations available
                          </p>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-4">
                      <ScrollArea className="h-[400px] px-2 pr-4">
                        {selectedVideo?.aiObservations.map((observation) => (
                          <motion.div
                            key={observation.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={getObservationClassName(
                              observation.sentiment,
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <p>{observation.description}</p>
                              {observation.timestamp && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                                  {observation.timestamp}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {observation.type}
                            </p>
                          </motion.div>
                        ))}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Observation Modal */}
      {selectedVideo && (
        <ObservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          observation={selectedObservation}
          videoUrl={selectedVideo.videoUrl}
          observations={selectedVideo.aiObservations}
          currentIndex={currentObservationIndex}
          onNext={handleNextObservation}
          onPrevious={handlePreviousObservation}
        />
      )}
    </div>
  );
}
