"use client";

import { VideoRecorder } from "@/app/verify/components/video-recorder";
import { ChecklistItem } from "@/app/verify/components/checklist/types";

export const VideoRecorderStory = () => {

  const handleVideoProcessed = (results: { items: ChecklistItem[] }) => {
    console.log("Video processed:", results);
  };

  const handleCancel = () => {
    console.log("Recording cancelled");
  };

  const handleSubmit = () => {
    console.log("Video submitted");
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden bg-background max-w-4xl mx-auto">
        <div className="h-[500px]">
          <VideoRecorder
            onVideoProcessed={handleVideoProcessed}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};
