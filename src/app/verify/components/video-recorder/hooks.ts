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
      
      // onstop will be set in the stopRecording function
      
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
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/mp4' });
          setVideoBlob(videoBlob);
          
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          
          // Clear the stream state
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
    
    // If there's an active stream, stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear the stream state
    setStream(null);
    
    // Reset media recorder
    mediaRecorderRef.current = null;
    videoChunksRef.current = [];
  }, []);

  const submitVideo = useCallback(async () => {
    if (!videoBlob) return null;
    
    setIsLoading(true);
    
    // Mock API call - replace with actual API
    try {
      // In a real implementation, you would upload the video to your backend
      // const formData = new FormData();
      // formData.append('video', videoBlob);
      // const response = await fetch('/api/verify', { method: 'POST', body: formData });
      // const data = await response.json();
      
      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResponse = {
        items: [
          { id: '1', description: 'TV remote placed on bedside table', status: 'verified' },
          { id: '2', description: 'Welcome card on bed', status: 'verified' },
          { id: '3', description: 'Fresh towels in bathroom', status: 'unverified' },
          { id: '4', description: 'Minibar stocked', status: 'declined' },
        ]
      };
      
      setIsLoading(false);
      return mockResponse;
    } catch (error) {
      console.error('Error submitting video:', error);
      setIsLoading(false);
      return null;
    }
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
