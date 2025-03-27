export interface RecordedVideoDataNew {
  blob: Blob;
  mimeType: string;
  url: string;
}

export interface VideoRecorderNewProps {
  onDone: (videoData: RecordedVideoDataNew) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  width?: string | number;
  height?: string | number;
}
