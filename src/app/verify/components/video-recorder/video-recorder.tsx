"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useVideoRecorder } from "./hooks";
import { VideoRecorderProps } from "./types";
import { Loader2, Video, X } from "lucide-react";

export const VideoRecorder = ({ onVideoProcessed }: VideoRecorderProps) => {
  const {
    isRecording,
    videoBlob,
    isLoading,
    stream,
    startRecording,
    stopRecording,
    resetRecording,
    submitVideo,
  } = useVideoRecorder();
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
    // The videoBlob will be set in the stopRecording function
    // and the useEffect above will create the preview URL
  };

  useEffect(() => {
    // When videoBlob changes, update the preview URL
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoPreviewUrl(url);
    }
  }, [videoBlob]);

  const handleReset = () => {
    resetRecording();
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
  };

  // Reference for the video element
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Set up the video stream when it becomes available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleSubmit = async () => {
    const results = await submitVideo();
    if (results) {
      onVideoProcessed(results);
    }
  };

  return (
    <motion.div
      className="w-full flex flex-col items-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full aspect-video bg-black/10 rounded-lg overflow-hidden border">
        {isRecording && (
          <motion.div
            className="absolute top-4 right-4 w-4 h-4 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}

        {videoPreviewUrl ? (
          <div className="relative w-full h-full">
            <video
              src={videoPreviewUrl}
              controls
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full h-full">
            {isRecording || stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full">
        {!videoBlob ? (
          isRecording ? (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              className="w-full"
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={handleStartRecording}
              variant="default"
              className="w-full"
            >
              Start Recording
            </Button>
          )
        ) : (
          <>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              variant="default"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Verify Room"
              )}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};
