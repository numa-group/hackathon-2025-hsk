export interface RecordedVideoDataNew {
  blob?: Blob;
  mimeType: string;
  url?: string;
  file?: File;
}

export interface VideoRecorderNewProps {
  hideCancel?: boolean;
  onDone: (videoData: RecordedVideoDataNew) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  width?: string | number;
  height?: string | number;
}
