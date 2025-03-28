"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRecordWebcam } from "react-record-webcam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoRecorderNewProps } from "./types";

export const VideoRecorderNew = ({
  onDone,
  onCancel,
  hideCancel = false,
  width = "100%",
  height = "100%",
}: VideoRecorderNewProps) => {
  const {
    devicesByType,
    clearAllRecordings,
    activeRecordings,
    openCamera,
    createRecording,
    cancelRecording,
    startRecording,
    stopRecording,
    errorMessage,
  } = useRecordWebcam({
    options: {
      fileName: `recording-${Date.now()}`,
      fileType: "mp4",
    },
    mediaRecorderOptions: {
      mimeType: "video/mp4",
    },
  });

  const deviceId = useRef(0);

  const switchDevice = useCallback(async () => {
    await Promise.all(
      activeRecordings.map((recording) => cancelRecording(recording.id)),
    );

    try {
      const videoDevices = devicesByType?.video;

      if (!videoDevices || videoDevices.length <= 0) {
        throw new Error("No video devices found");
      }
      const device = videoDevices[deviceId.current % videoDevices.length];
      console.log("DEVICE: ", device, deviceId.current, devicesByType);
      deviceId.current = (deviceId.current + 1) % videoDevices.length;
      if (!device) {
        console.log("NO DEVICE:::");
        return;
      }

      const recording = await createRecording(device.deviceId);
      if (!recording) return;

      await openCamera(recording.id);
    } catch (error) {
      console.error("Failed to initialize camera:", error);
    }
  }, [
    activeRecordings,
    cancelRecording,
    createRecording,
    devicesByType,
    openCamera,
  ]);

  const started = useRef(false);
  useEffect(() => {
    if ((devicesByType?.video.length ?? 0) > 0 && !started.current) {
      started.current = true;
      switchDevice();
    }
  }, [activeRecordings, devicesByType?.video.length, switchDevice]);

  const handleDoneRecording = useCallback(async () => {
    try {
      await Promise.all(
        activeRecordings.map((recording) => stopRecording(recording.id)),
      );
      const [result] = activeRecordings.map((v) => v.blob);

      if (!result) {
        throw new Error("No recording data found");
      }
      await clearAllRecordings();
      onDone({
        blob: result,
        mimeType: "video/mp4",
        url: URL.createObjectURL(result),
      });
    } catch (error) {
      if (error instanceof Error) {
        alert("Failed to save recording: " + error.message);
      } else {
        alert("Failed to save recording: ");
      }
    }
  }, [activeRecordings, onDone, stopRecording]);

  const handleCancelRecording = useCallback(async () => {
    await Promise.all(
      activeRecordings.map((recording) => cancelRecording(recording.id)),
    );

    onCancel();
  }, [activeRecordings, cancelRecording, onCancel]);

  // const formatTime = (seconds: number): string => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  // };

  const [activeRecording] = activeRecordings;

  return (
    <div className="flex flex-col h-full" style={{ width, height }}>
      <div
        className={cn("relative rounded-lg overflow-hidden bg-black flex-1")}
      >
        {/* Live video preview */}
        {activeRecording && (
          <video
            ref={activeRecording.webcamRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Recording indicator */}
        {/* {isRecording && ( */}
        {/*   <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 px-2 py-1 rounded-full text-white"> */}
        {/*     <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" /> */}
        {/*     <span className="text-sm font-medium"> */}
        {/*       {formatTime(recordingTime)} / {formatTime(maxDuration)} */}
        {/*     </span> */}
        {/*   </div> */}
        {/* )} */}

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
      <div className="flex justify-between items-center mt-4 gap-2">
        <Button onClick={switchDevice}>Switch Device</Button>
        {!hideCancel && (
          <Button variant="outline" onClick={handleCancelRecording}>
            Cancel
          </Button>
        )}
        {activeRecording?.status === "RECORDING" ? (
          <Button variant="destructive" onClick={handleDoneRecording}>
            Stop Recording
          </Button>
        ) : (
          <Button
            disabled={activeRecordings.length <= 0}
            onClick={async () => {
              await startRecording(activeRecording.id);
            }}
          >
            Start Recording
          </Button>
        )}
      </div>
    </div>
  );
};
