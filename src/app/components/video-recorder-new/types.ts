export interface RecordedVideoDataNew {
  url: string;
  blob: Blob;
  file: File;
  mimeType: string;
  duration: number;
}

export interface VideoRecorderNewProps {
  onDone: (videoData: RecordedVideoDataNew) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  width?: string | number;
  height?: string | number;
}
