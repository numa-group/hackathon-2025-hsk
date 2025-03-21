"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { RecordedVideoData, VideoRecorderProps } from "./types";
import { cn } from "@/lib/utils";

export function VideoRecorder({
  onDone,
  onCancel,
  maxDuration = 30, // default 30 seconds
  width = "100%",
  height = "100%",
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Process recorded chunks and call onDone
  const processRecording = useCallback(() => {
    if (chunksRef.current.length === 0) {
      setError("No video data recorded");
      return;
    }

    // Use a more compatible MIME type for mobile devices
    // Some mobile browsers don't support specific codecs in the MIME type
    const mimeType = "video/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create a File object from the Blob
    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: mimeType,
    });
    
    const videoData: RecordedVideoData = {
      file,
      url,
      mimeType,
      duration: recordingTime,
    };

    // Clean up media stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Then call the onDone prop with the video data
    onDone(videoData);
  }, [onDone, recordingTime]);

  // Stop recording and process the video
  const stopRecordingAndProcess = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Process after a short delay to ensure all data is collected
      setTimeout(() => {
        processRecording();
      }, 300); // Increased delay to ensure all chunks are collected
    }
  }, [isRecording, processRecording]);

  // Force stop recording when max duration is reached
  useEffect(() => {
    if (recordingTime >= maxDuration && isRecording) {
      stopRecordingAndProcess();
    }
  }, [recordingTime, maxDuration, isRecording, stopRecordingAndProcess]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setError(null);
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in your browser or environment. Please ensure you're using HTTPS and have granted camera permissions.");
      }
      
      // Get user media - use rear camera on mobile devices
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" } // Use rear camera when available
        },
        audio: true,
      });
      
      streamRef.current = stream;
      
      // Set up video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
      }
      
      // Create media recorder with more compatible options for mobile
      const options = { mimeType: 'video/webm' };
      
      // Try to create with the specified options, fall back to browser defaults if not supported
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("Requested MIME type not supported, using browser defaults", e);
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Set up timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop if max duration reached
          if (newTime >= maxDuration) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            stopRecordingAndProcess();
            return maxDuration; // Cap at max duration
          }
          return newTime;
        });
      }, 1000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access camera or microphone. Please check permissions.");
    }
  }, [maxDuration, stopRecordingAndProcess]);



  // Handle cancel button click
  const handleCancel = useCallback(() => {
    // Stop recording if in progress
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    onCancel();
  }, [isRecording, onCancel]);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Auto-start recording when component mounts
  useEffect(() => {
    // Only start recording if not already recording
    if (!isRecording && !streamRef.current) {
      const timeoutId = setTimeout(() => {
        startRecording();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isRecording, startRecording]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md w-full"
        >
          {error}
        </motion.div>
      )}
      
      <div 
        className={cn(
          "relative rounded-lg overflow-hidden bg-black flex-1",
          isRecording && "ring-2 ring-destructive"
        )}
        style={{ width, height }}
      >
        {/* Video element for preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Recording indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-3 h-3 rounded-full bg-destructive"
          />
          <span className="text-sm font-medium">
            Recording {formatTime(recordingTime)}
          </span>
        </div>
        
        {/* Duration indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full">
          <span className="text-sm font-medium">
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col w-full gap-3 p-4">
        <div className="flex justify-between gap-3">
          <Button
            variant="default"
            onClick={stopRecordingAndProcess}
            className="flex-1"
          >
            I&apos;m Done
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
