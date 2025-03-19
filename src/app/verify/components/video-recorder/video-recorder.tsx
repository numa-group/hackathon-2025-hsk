"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useVideoRecorder } from "./hooks";
import { VideoRecorderProps } from "./types";
import { Loader2, Video, X, ArrowLeft } from "lucide-react";

export const VideoRecorder = ({ onVideoProcessed, onCancel, onSubmit }: VideoRecorderProps) => {
  const {
    isRecording,
    videoBlob,
    stream,
    startRecording,
    stopRecording,
    resetRecording,
    submitVideo,
    isLoading
  } = useVideoRecorder();
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Start recording automatically when component mounts
  useEffect(() => {
    const initRecording = async () => {
      await startRecording();
    };
    initRecording();
    
    // Cleanup function
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      resetRecording();
    };
  }, [startRecording, resetRecording, videoPreviewUrl]);

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleReset = () => {
    resetRecording();
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    startRecording();
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
    if (isLoading) return;
    
    onSubmit();
    
    const blob = await submitVideo();
    if (blob) {
      // For the storyboard, we'll just pass a mock result
      onVideoProcessed({
        items: [
          { id: '1', description: 'TV remote placed on bedside table', status: 'verified' },
          { id: '2', description: 'Welcome card on bed', status: 'verified' },
          { id: '3', description: 'Fresh towels in bathroom', status: 'unverified' },
          { id: '4', description: 'Minibar stocked', status: 'declined' },
          { id: '5', description: 'Bed properly made', status: 'verified' },
        ]
      });
    }
  };
  
  useEffect(() => {
    // When videoBlob changes, update the preview URL
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoPreviewUrl(url);
    }
  }, [videoBlob]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="relative w-full flex-1 bg-black overflow-hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full"
          onClick={onCancel}
        >
          <ArrowLeft size={18} />
        </Button>
        
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full text-white text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            Recording
          </div>
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
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full h-full">
            {stream ? (
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

      <div className="w-full p-4 bg-background">
        {isRecording ? (
          <Button
            onClick={handleStopRecording}
            variant="destructive"
            className="w-full h-12 text-base"
            size="lg"
          >
            Stop Recording
          </Button>
        ) : !videoBlob ? (
          <Button
            onClick={startRecording}
            variant="default"
            className="w-full h-12 text-base"
            size="lg"
          >
            Start Recording
          </Button>
        ) : isLoading ? (
          <Button
            disabled
            className="w-full h-12 text-base"
            size="lg"
          >
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Video
          </Button>
        ) : (
          <div className="flex gap-3 w-full">
            <Button onClick={handleReset} variant="outline" className="flex-1 h-12">
              Record Again
            </Button>
            <Button
              onClick={handleSubmit}
              variant="default"
              className="flex-1 h-12"
            >
              Process Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
