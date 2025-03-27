export interface RecordedVideoData {
  file: File;
  url: string;
  mimeType: string;
  duration: number;
}

export interface VideoRecorderProps {
  onDone: (videoData: RecordedVideoData) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  width?: string | number;
  height?: string | number;
}
