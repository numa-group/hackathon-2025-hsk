import { useState, useRef, useCallback } from 'react';

export const useVideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      videoChunksRef.current = [];
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      return new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = () => {
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          setVideoBlob(videoBlob);
          
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          
          setStream(null);
          resolve(videoBlob);
        };
        
        mediaRecorderRef.current!.stop();
        setIsRecording(false);
      });
    }
    return Promise.resolve(null);
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setVideoBlob(null);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setStream(null);
    mediaRecorderRef.current = null;
    videoChunksRef.current = [];
  }, []);

  // Simplified submitVideo that just triggers the callback with the video blob
  const submitVideo = useCallback(async () => {
    if (!videoBlob) return;
    
    setIsLoading(true);
    
    // Simulate a brief processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    
    // Return the video blob for the parent component to handle
    return videoBlob;
  }, [videoBlob]);

  return {
    isRecording,
    videoBlob,
    isLoading,
    stream,
    startRecording,
    stopRecording,
    resetRecording,
    submitVideo
  };
};
