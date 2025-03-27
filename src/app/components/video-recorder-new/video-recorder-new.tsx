"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRecordWebcam } from "react-record-webcam";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoRecorderNewProps, RecordedVideoDataNew } from "./types";

export const VideoRecorderNew = ({
  onDone,
  onCancel,
  maxDuration = 30,
  width = "100%",
  height = "100%",
}: VideoRecorderNewProps) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    activeRecordings,
    createRecording,
    openCamera,
    closeCamera,
    startRecording,
    stopRecording,
    clearPreview,
    errorMessage,
    webcamRef,
  } = useRecordWebcam({
    options: {
      fileName: `recording-${Date.now()}`,
      fileType: "webm",
    },
    mediaRecorderOptions: {
      mimeType: "video/webm;codecs=vp8,opus",
    },
    mediaTrackConstraints: {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    },
  });

  // Get the active recording
  const activeRecording = recordingId 
    ? activeRecordings.find(recording => recording.id === recordingId) 
    : null;
  
  // Determine recording state
  const isRecording = activeRecording?.status === "RECORDING";
  const isPreview = activeRecording?.status === "STOPPED" || activeRecording?.status === "PREVIEW";

  // Initialize recorder
  useEffect(() => {
    let isMounted = true;
    
    const initRecorder = async () => {
      try {
        // Only create a recording if we don't already have one
        if (!recordingId) {
          const recording = await createRecording();
          if (recording && isMounted) {
            setRecordingId(recording.id);
            await openCamera(recording.id);
          }
        }
      } catch (error) {
        console.error("Error initializing recorder:", error);
      }
    };

    initRecorder();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Clean up recording on unmount
      if (recordingId) {
        closeCamera(recordingId).catch(console.error);
      }
    };
  }, [createRecording, openCamera, closeCamera, recordingId]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            // Don't call handleStopRecording directly in the state updater
            // Instead, set a flag that we need to stop
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, maxDuration]);
  
  // Define callback functions first
  const handleStartRecording = useCallback(async () => {
    if (!recordingId) return;
    
    setRecordingTime(0);
    
    try {
      if (activeRecording?.status === "PREVIEW") {
        await clearPreview(recordingId);
      }
      
      await startRecording(recordingId);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, [recordingId, activeRecording, clearPreview, startRecording]);

  const handleStopRecording = useCallback(async () => {
    if (!recordingId || !isRecording) return;
    
    try {
      await stopRecording(recordingId);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }, [recordingId, isRecording, stopRecording]);

  // Handle auto-stop when max duration is reached
  useEffect(() => {
    if (recordingTime >= maxDuration && isRecording) {
      handleStopRecording();
    }
  }, [recordingTime, maxDuration, isRecording, handleStopRecording]);

  // Log errors
  useEffect(() => {
    if (errorMessage) {
      console.error("Recording error:", errorMessage);
    }
  }, [errorMessage]);

  const handleSaveRecording = useCallback(async () => {
    if (!recordingId || !activeRecording) return;

    setIsProcessing(true);

    try {
      // Get the recording blob
      const blob = activeRecording.blob;
      if (!blob) {
        console.error("No recording available");
        return;
      }

      const file = new File([blob], `recording-${Date.now()}.webm`, {
        type: blob.type,
      });

      const videoData: RecordedVideoDataNew = {
        url: activeRecording.objectURL || URL.createObjectURL(blob),
        blob,
        file,
        mimeType: blob.type,
        duration: recordingTime,
      };

      onDone(videoData);
    } catch (error) {
      console.error("Error saving recording:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [recordingId, activeRecording, recordingTime, onDone]);

  const handleCancelRecording = useCallback(() => {
    if (recordingId) {
      closeCamera(recordingId).catch(console.error);
    }
    onCancel();
  }, [recordingId, closeCamera, onCancel]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full" style={{ width, height }}>
      <div
        className={cn(
          "relative rounded-lg overflow-hidden bg-black flex-1",
          isRecording && "ring-2 ring-destructive",
        )}
      >
        {/* Video preview */}
        <video
          ref={webcamRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 px-2 py-1 rounded-full">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </span>
          </div>
        )}

        {/* Preview video */}
        {isPreview && activeRecording?.objectURL && (
          <video
            ref={activeRecording.previewRef}
            src={activeRecording.objectURL}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-white text-center p-4">
              <p className="text-destructive font-bold mb-2">Error</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <motion.div
        className="flex justify-between items-center mt-4 gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isPreview ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (recordingId) {
                  clearPreview(recordingId);
                  setRecordingTime(0);
                }
              }}
              disabled={isProcessing}
            >
              Retake
            </Button>
            <Button onClick={handleSaveRecording} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Use Video"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleCancelRecording}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {isRecording ? (
              <Button
                variant="destructive"
                onClick={handleStopRecording}
                disabled={isProcessing}
              >
                Stop Recording
              </Button>
            ) : (
              <Button
                onClick={handleStartRecording}
                disabled={isProcessing || !activeRecording}
              >
                Start Recording
              </Button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
