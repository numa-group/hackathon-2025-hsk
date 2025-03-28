"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ObservationModal } from "../components/observation-modal";
import { ManualObservationsModal } from "../components/manual-observations-modal";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  processVideoAnalysis,
  loadAllAnalyses,
  VideoAnalysis,
  AnalysisObservation,
} from "./actions";

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<
    (VideoAnalysis & { manualObservations: AnalysisObservation[] })[]
  >([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState<
    "success" | "error" | "info"
  >("info");
  const [showMessage, setShowMessage] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [totalUploads, setTotalUploads] = useState(0);
  const [fileStatuses, setFileStatuses] = useState<
    Record<
      string,
      {
        status: "pending" | "processing" | "success" | "error";
        message?: string;
      }
    >
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualObsModalOpen, setIsManualObsModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] =
    useState<AnalysisObservation | null>(null);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Calculate video statistics for the dropdown and sort by negative count (highest first)
  const videoStats = useMemo(() => {
    return analyses
      .map((video) => {
        const positiveCount = video.aiObservations.filter(
          (obs) => obs.sentiment === "positive",
        ).length;
        const negativeCount = video.aiObservations.filter(
          (obs) => obs.sentiment === "negative",
        ).length;
        const manualCount = video.manualObservations.length;

        return {
          id: video.id,
          title: video.title,
          positiveCount,
          negativeCount,
          manualCount,
          totalObservations: video.aiObservations.length,
          duration: video.duration || "00:00",
        };
      })
      .sort((a, b) => b.negativeCount - a.negativeCount);
  }, [analyses]);

  const selectedVideo = analyses.find((video) => video.id === selectedVideoId);

  // Function to get video duration
  const getVideoDuration = (videoUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = function () {
        resolve(0); // Return 0 if there's an error
      };

      video.src = videoUrl;
    });
  };

  // Format seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Load all analyses on component mount
  useEffect(() => {
    async function fetchAnalyses() {
      const allAnalyses = await loadAllAnalyses();
      setAnalyses(allAnalyses);

      // Select the first video if available and none is selected
      if (allAnalyses.length > 0 && !selectedVideoId) {
        setSelectedVideoId(allAnalyses[0].id);
      }

      // Get durations for all videos
      for (const analysis of allAnalyses) {
        getVideoDuration(analysis.videoUrl).then((duration) => {
          setAnalyses((prev) =>
            prev.map((item) =>
              item.id === analysis.id
                ? { ...item, duration: formatDuration(duration) }
                : item,
            ),
          );
        });
      }
    }

    fetchAnalyses();
  }, [selectedVideoId]);

  const handleVideoChange = (value: string) => {
    setSelectedVideoId(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent any default behavior

    if (!e.target.files || e.target.files.length === 0) return;

    // Convert FileList to array
    const files = Array.from(e.target.files);

    // Filter out non-video files
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length === 0) {
      setUploadMessage("Please upload video files only");
      return;
    }

    // Initialize file statuses
    const initialStatuses: Record<
      string,
      {
        status: "pending" | "processing" | "success" | "error";
        message?: string;
      }
    > = {};
    videoFiles.forEach((file) => {
      initialStatuses[file.name] = { status: "pending" };
    });
    setFileStatuses(initialStatuses);

    // Check file sizes (limit to 100MB each)
    const oversizedFiles = videoFiles.filter(
      (file) => file.size > 1024 * 1024 * 100,
    );
    if (oversizedFiles.length > 0) {
      setUploadMessage(
        `${oversizedFiles.length} file(s) exceed 100MB limit and will be skipped`,
      );

      // Mark oversized files as errors
      const updatedStatuses = { ...initialStatuses };
      oversizedFiles.forEach((file) => {
        updatedStatuses[file.name] = {
          status: "error",
          message: "File exceeds 100MB limit",
        };
      });
      setFileStatuses(updatedStatuses);

      // Remove oversized files
      const validFiles = videoFiles.filter(
        (file) => file.size <= 1024 * 1024 * 100,
      );
      if (validFiles.length === 0) return;

      // Process valid files
      setUploadQueue(validFiles);
      setTotalUploads(validFiles.length);
      setCurrentUploadIndex(0);
    } else {
      // All files are valid
      setUploadQueue(videoFiles);
      setTotalUploads(videoFiles.length);
      setCurrentUploadIndex(0);
    }

    // Start processing the queue in a separate step to avoid race conditions
    setTimeout(() => {
      processNextInQueue(videoFiles, 0).catch((error) => {
        console.error("Error processing upload queue:", error);
      });
    }, 0);
  };

  const processNextInQueue = async (queue: File[], index: number) => {
    // Safety check to prevent processing an empty queue
    if (!queue || queue.length === 0) {
      setIsUploading(false);
      return;
    }

    if (index >= queue.length) {
      // All uploads complete
      setIsUploading(false);

      // Get the latest file statuses to count successes and failures
      setFileStatuses((currentStatuses) => {
        const statuses = Object.values(currentStatuses);
        const successCount = statuses.filter(
          (s) => s.status === "success",
        ).length;
        const errorCount = statuses.filter((s) => s.status === "error").length;

        // Update the upload message with the correct counts
        setUploadMessage(
          `Upload complete: ${successCount} successful, ${errorCount} failed or skipped.`,
        );
        setMessageStatus(successCount > 0 ? "success" : "error");
        setShowMessage(true);

        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);

        return currentStatuses; // Return unchanged, we just needed the latest state
      });

      setUploadQueue([]);

      // Reset the form
      if (formRef.current) {
        formRef.current.reset();
      }
      return;
    }

    const currentFile = queue[index];

    try {
      // Update status to processing
      setFileStatuses((prev) => ({
        ...prev,
        [currentFile.name]: { status: "processing" },
      }));

      await handleUpload(currentFile, index, queue.length);

      // Process next file only after current one is complete
      setCurrentUploadIndex(index + 1);

      // Use setTimeout to avoid call stack issues with deep recursion
      // and to ensure React state updates properly between files
      setTimeout(() => {
        processNextInQueue(queue, index + 1).catch((err) => {
          console.error(`Error in queue processing:`, err);
        });
      }, 100);
    } catch (error) {
      console.error(`Error processing file at index ${index}:`, error);

      // Update status to error (this might be redundant as handleUpload also sets error status)
      setFileStatuses((prev) => ({
        ...prev,
        [currentFile.name]: {
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        },
      }));

      // Continue with next file even if this one failed
      setCurrentUploadIndex(index + 1);

      // Use setTimeout to avoid call stack issues with deep recursion
      setTimeout(() => {
        processNextInQueue(queue, index + 1).catch((err) => {
          console.error(`Error in queue processing:`, err);
        });
      }, 100);
    }
  };

  const handleUpload = async (
    file: File,
    index: number = 0,
    total: number = 1,
  ) => {
    setIsUploading(true);
    setUploadMessage(
      `Uploading and analyzing video ${index + 1} of ${total}: ${file.name}...`,
    );
    setMessageStatus("info");
    setShowMessage(true);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const result = await processVideoAnalysis(formData);

      if (result.success) {
        // Update status to success
        setFileStatuses((prev) => ({
          ...prev,
          [file.name]: { status: "success" },
        }));
        setMessageStatus("success");
        setShowMessage(true);

        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);

        // Only refresh the analyses list after successful upload
        // This is done without causing a full page reload
        const updatedAnalyses = await loadAllAnalyses();
        setAnalyses(updatedAnalyses);

        // Select the newly uploaded video if available
        if (result.analysis) {
          setSelectedVideoId(result.analysis.id);
        }
      } else {
        console.error(`Error processing ${file.name}: ${result.message}`);

        // Update status to error
        setFileStatuses((prev) => ({
          ...prev,
          [file.name]: { status: "error", message: result.message },
        }));
        setMessageStatus("error");
        setShowMessage(true);

        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);

        // Don't throw if the file already exists - just continue
        if (!result.message.includes("already exists")) {
          throw new Error(result.message);
        }
      }

      return result;
    } catch (error) {
      // Update status to error
      setFileStatuses((prev) => ({
        ...prev,
        [file.name]: {
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        },
      }));

      throw error;
    }
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
                e.preventDefault(); // Prevent form submission
                return false; // Ensure no default behavior
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
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
                {isUploading
                  ? `Uploading ${currentUploadIndex}/${totalUploads}...`
                  : "Upload Videos"}
              </Button>
            </form>

            <Select value={selectedVideoId} onValueChange={handleVideoChange}>
              <SelectTrigger className="w-full sm:w-[250px] px-3 py-2">
                {selectedVideoId ? (
                  <div className="flex items-center">
                    <span className="truncate">
                      {videoStats.find((v) => v.id === selectedVideoId)
                        ?.title || "Select a video"}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      {(videoStats.find((v) => v.id === selectedVideoId)
                        ?.positiveCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                          +
                          {
                            videoStats.find((v) => v.id === selectedVideoId)
                              ?.positiveCount
                          }
                        </span>
                      )}
                      {(videoStats.find((v) => v.id === selectedVideoId)
                        ?.negativeCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                          -
                          {
                            videoStats.find((v) => v.id === selectedVideoId)
                              ?.negativeCount
                          }
                        </span>
                      )}
                      {(videoStats.find((v) => v.id === selectedVideoId)
                        ?.manualCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                          M:
                          {
                            videoStats.find((v) => v.id === selectedVideoId)
                              ?.manualCount
                          }
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a video" />
                )}
              </SelectTrigger>
              <SelectContent className="max-w-[350px]">
                {videoStats.map((video) => (
                  <SelectItem key={video.id} value={video.id} className="py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="font-medium">{video.title}</span>
                        <div className="flex items-center gap-1 ml-2">
                          {video.positiveCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                              +{video.positiveCount}
                            </span>
                          )}
                          {video.negativeCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                              -{video.negativeCount}
                            </span>
                          )}
                          {video.manualCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                              M:{video.manualCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {video.duration}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {uploadMessage && showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg text-sm font-medium border",
              messageStatus === "error" &&
                "bg-destructive/15 text-destructive border-destructive/30",
              messageStatus === "success" &&
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30",
              messageStatus === "info" &&
                "bg-primary/10 text-primary border-primary/20",
            )}
          >
            {uploadMessage}
          </motion.div>
        )}

        {isUploading && uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Upload Progress</p>
                <p className="text-xs text-muted-foreground">
                  Processing {currentUploadIndex} of {totalUploads} videos
                </p>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${(currentUploadIndex / totalUploads) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium">File Status:</p>
                <div className="max-h-[200px] overflow-y-auto pr-2">
                  {Object.entries(fileStatuses).map(([filename, status]) => (
                    <div
                      key={filename}
                      className={cn(
                        "flex items-center justify-between py-2 px-2 border-b border-muted last:border-0 rounded",
                        status.status === "error" && "bg-destructive/10",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span
                          className={cn(
                            "size-3 rounded-full",
                            status.status === "pending" && "bg-muted",
                            status.status === "processing" && "bg-blue-500",
                            status.status === "success" && "bg-green-500",
                            status.status === "error" &&
                              "bg-destructive animate-pulse",
                          )}
                        ></span>
                        <span className="text-xs truncate" title={filename}>
                          {filename}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          status.status === "pending" &&
                            "text-muted-foreground",
                          status.status === "processing" &&
                            "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
                          status.status === "success" &&
                            "text-green-600 bg-green-50 dark:bg-green-950/30",
                          status.status === "error" &&
                            "text-white bg-destructive",
                        )}
                      >
                        {status.status === "pending" && "Waiting..."}
                        {status.status === "processing" && "Processing..."}
                        {status.status === "success" && "Complete"}
                        {status.status === "error" &&
                          (status.message || "Failed")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  className="bg-muted rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden h-[500px] lg:h-[700px] aspect-[9/16] mx-auto"
                  onClick={() => {
                    setSelectedObservation(null);
                    setIsModalOpen(true);
                  }}
                >
                  <video
                    src={selectedVideo.videoUrl}
                    className="h-full w-full rounded-lg object-contain"
                    playsInline
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>AI Observations</CardTitle>
                  <CardDescription>
                    Analysis of the property condition
                  </CardDescription>
                </div>
                {selectedVideo.manualObservations.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsManualObsModalOpen(true)}
                    className="ml-auto"
                  >
                    View Manual Observations
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                  {selectedVideo.aiObservations.map((observation) => (
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
          </motion.div>
        )}
      </div>

      {/* Observation Modal */}
      {selectedVideo && (
        <>
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

          <ManualObservationsModal
            isOpen={isManualObsModalOpen}
            onClose={() => setIsManualObsModalOpen(false)}
            observations={selectedVideo.manualObservations}
          />
        </>
      )}
    </div>
  );
}
