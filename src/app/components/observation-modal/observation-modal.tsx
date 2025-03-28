"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ObservationModalProps } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ObservationModal({
  isOpen,
  onClose,
  observation,
  videoUrl,
  observations,
  currentIndex,
  onNext,
  onPrevious,
}: ObservationModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse timestamp to seconds
  const parseTimestamp = (timestamp: string): number => {
    const parts = timestamp.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // State to force re-render when video loads and for tracking playback
  const [, setVideoLoaded] = useState(false);
  const [, setPlaybackTime] = useState(0);
  const [, setIsPaused] = useState(false);

  // Set video to the correct timestamp and restrict playback to ±1 second range
  useEffect(() => {
    if (!videoRef.current || !isOpen) return;

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
    };

    const handlePlayPause = () => {
      setIsPaused(videoRef.current?.paused || false);
    };

    // Different behavior based on whether we're viewing an observation or just the video
    if (observation?.timestamp) {
      const timeInSeconds = parseTimestamp(observation.timestamp);

      // Set initial time to the timestamp
      videoRef.current.currentTime = timeInSeconds - 1; // Start 1 second before

      // Add event listener to restrict playback
      const handleTimeUpdate = () => {
        // If video time is outside the ±1 second range, reset to start of range
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const minAllowed = timeInSeconds - 1;
          const maxAllowed = timeInSeconds + 1;

          if (currentTime < minAllowed || currentTime > maxAllowed) {
            videoRef.current.currentTime = minAllowed;
          }

          // Update state to force re-render for progress indicator
          setPlaybackTime(currentTime);
          setIsPaused(videoRef.current.paused);
        }
      };

      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoRef.current.addEventListener("play", handlePlayPause);
      videoRef.current.addEventListener("pause", handlePlayPause);

      videoRef.current
        .play()
        .catch((err) => console.error("Error playing video:", err));

      return () => {
        videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
        videoRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        videoRef.current?.removeEventListener("play", handlePlayPause);
        videoRef.current?.removeEventListener("pause", handlePlayPause);
      };
    } else {
      // Just regular video playback without restrictions
      const handleTimeUpdate = () => {
        setPlaybackTime(videoRef.current?.currentTime || 0);
        setIsPaused(videoRef.current?.paused || false);
      };

      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoRef.current.addEventListener("play", handlePlayPause);
      videoRef.current.addEventListener("pause", handlePlayPause);

      return () => {
        videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
        videoRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        videoRef.current?.removeEventListener("play", handlePlayPause);
        videoRef.current?.removeEventListener("pause", handlePlayPause);
      };
    }
  }, [observation, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrevious]);

  // If no observation but modal is open, show just the video player
  const isFullVideoMode = isOpen && !observation;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-w-7xl p-0 overflow-hidden w-[95vw] h-[70vh] min-w-[1000px]",
          isFullVideoMode ? "max-w-5xl" : "max-w-7xl"
        )}
      >
        {isFullVideoMode ? (
          // Full video mode - just show the video player
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
            </DialogHeader>
            <div className="bg-black rounded-lg overflow-hidden relative mt-4 h-[calc(70vh-100px)]">
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain max-h-[calc(70vh-100px)]"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        ) : (
          // Observation mode - show observation details and restricted video
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
            {/* Observation details */}
            <div className="flex flex-col">
              <DialogHeader>
                <DialogTitle>Observation</DialogTitle>
              </DialogHeader>
              <div
                className={cn(
                  "p-4 rounded-lg mb-4 mt-4 max-h-[300px] overflow-y-auto",
                  observation?.sentiment === "positive" &&
                    "bg-primary/10 border-l-4 border-primary",
                  observation?.sentiment === "negative" &&
                    "bg-destructive/10 border-l-4 border-destructive",
                )}
              >
                <p className="mb-2">{observation?.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {observation?.type}
                  </span>
                  {observation?.timestamp ? (
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                      {observation.timestamp}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      No timestamp
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-auto">
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {observations.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onNext}
                    disabled={currentIndex === observations.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video player */}
            <div className="flex flex-col h-full">
              <div className="bg-black rounded-lg overflow-hidden flex-1 relative h-[calc(70vh-200px)]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain max-h-[calc(70vh-100px)]"
                    autoPlay
                    loop
                    onClick={() => {
                      if (videoRef.current?.paused) {
                        videoRef.current?.play();
                      } else {
                        videoRef.current?.pause();
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Play/Pause overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      if (videoRef.current?.paused) {
                        videoRef.current?.play();
                      } else {
                        videoRef.current?.pause();
                      }
                    }}
                  >
                    {videoRef.current?.paused && (
                      <div className="bg-black/40 rounded-full p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
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
                    )}
                  </div>
                </div>

                {/* Custom progress bar with timestamp highlight */}
                <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-none">
                  <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    {videoRef.current && observation?.timestamp && (
                      <>
                        {/* Timestamp marker */}
                        <div
                          className="absolute top-0 bottom-0 w-[6px] bg-primary z-10"
                          style={{
                            left: `${(parseTimestamp(observation.timestamp) / (videoRef.current?.duration || 100)) * 100}%`,
                            transform: "translateX(-50%)",
                          }}
                        ></div>

                        {/* Highlighted range */}
                        <div
                          className="absolute top-0 bottom-0 bg-primary/30 border-l border-r border-primary/50"
                          style={{
                            left: `${((parseTimestamp(observation.timestamp) - 1) / (videoRef.current?.duration || 100)) * 100}%`,
                            width: `${(2 / (videoRef.current?.duration || 100)) * 100}%`,
                          }}
                        >
                          {/* Progress indicator within highlight */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-primary/50"
                            style={{
                              width: `${Math.max(0, Math.min(100, (((videoRef.current?.currentTime || 0) - (parseTimestamp(observation.timestamp) - 1)) / 2) * 100))}%`,
                            }}
                          ></div>
                        </div>

                        {/* Timestamp label */}
                        <div
                          className="absolute top-[-24px] bg-primary/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium text-primary border border-primary/30"
                          style={{
                            left: `${(parseTimestamp(observation.timestamp) / (videoRef.current?.duration || 100)) * 100}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          {observation.timestamp}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {observation?.timestamp ? (
                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-4 bg-muted/30 p-3 rounded-lg">
                    <div className="flex flex-col items-center">
                      <span className="text-xs">
                        {parseTimestamp(observation.timestamp) - 1}s
                      </span>
                      <div className="h-4 w-1 bg-primary/30 mt-1"></div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="font-medium text-primary">
                        {parseTimestamp(observation.timestamp)}s
                      </span>
                      <div className="h-6 w-1 bg-primary mt-1"></div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs">
                        {parseTimestamp(observation.timestamp) + 1}s
                      </span>
                      <div className="h-4 w-1 bg-primary/30 mt-1"></div>
                    </div>
                  </div>
                  <p className="text-center mt-2">
                    Video playback is restricted to this 3-second segment (
                    {parseTimestamp(observation.timestamp) - 1}s -{" "}
                    {parseTimestamp(observation.timestamp) + 1}s)
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg text-center">
                  <p>No timestamp available for this observation.</p>
                  <p>Full video playback is available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
