# Components Documentation

This document provides detailed information about all the components in our application, their function signatures, and usage examples.

## Table of Contents

1. [Checklist Component](#checklist-component)
2. [Verification Screen Component](#verification-screen-component)
3. [Video Recorder Component](#video-recorder-component)

---

## Checklist Component

The Checklist component displays a list of verification items with their status.

### Types

```typescript
// ChecklistItemStatus - Possible status values for checklist items
type ChecklistItemStatus = 'unverified' | 'verified' | 'declined';

// ChecklistItem - Structure of each item in the checklist
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: ChecklistItemStatus;
}

// ChecklistProps - Props for the Checklist component
interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  description?: string;
}
```

### Usage

```tsx
import { Checklist, ChecklistItem } from "@/app/components/checklist";

// Example items
const items: ChecklistItem[] = [
  {
    id: "1",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "verified",
  },
  {
    id: "2",
    title: "Face Verification",
    description: "Record a clear video of your face",
    status: "unverified",
  },
  {
    id: "3",
    title: "Proof of Address",
    description: "Show a utility bill or bank statement with your address",
    status: "declined",
  },
];

// Render the component
<Checklist 
  items={items} 
  title="Verification Checklist"
  description="The following items need to be verified through video recording"
/>
```

### Features

- Displays items with different visual styles based on their status
- Automatically sorts items by status (unverified, declined, verified)
- Smooth animations when items change status
- Uses shadcn theme colors for consistent styling

---

## Verification Screen Component

The Verification Screen component provides a complete verification flow UI with multiple states.

### Types

```typescript
// VerificationScreenState - Possible states for the verification screen
type VerificationScreenState = 'initial' | 'update' | 'success';

// VerificationScreenProps - Props for the VerificationScreen component
interface VerificationScreenProps {
  title: string;
  description: string;
  checklistItems: ChecklistItem[];
  onRecordClick: () => void;
  onContinueClick?: () => void;
  isLoading?: boolean;
  state?: VerificationScreenState;
  successMessage?: string;
}
```

### Usage

```tsx
import { VerificationScreen } from "@/app/components/verification-screen";
import { ChecklistItem } from "@/app/components/checklist";

// Example items
const items: ChecklistItem[] = [
  {
    id: "1",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
  },
  // ... more items
];

// Initial state
<VerificationScreen
  title="Video Verification"
  description="Complete the verification process by recording a short video"
  checklistItems={items}
  onRecordClick={() => {
    // Handle record button click
    console.log("Record button clicked");
  }}
/>

// Update state
<VerificationScreen
  title="Continue Verification"
  description="Review your verification status and continue the process"
  checklistItems={items}
  onContinueClick={() => {
    // Handle continue button click
    console.log("Continue button clicked");
  }}
  state="update"
  isLoading={false}
/>

// Success state
<VerificationScreen
  title="Verification Complete"
  description="All items have been successfully verified"
  checklistItems={items}
  state="success"
  successMessage="Congratulations! Your identity has been successfully verified."
/>
```

### Features

- Three distinct states: initial, update, and success
- Displays a checklist of verification items
- Shows a success screen when all items are verified
- Loading state for async operations
- Customizable success message

---

## Video Recorder Component

The Video Recorder component provides a UI for recording video from the user's camera.

### Types

```typescript
// RecordedVideoData - Structure of the recorded video data
interface RecordedVideoData {
  file: File;
  url: string;
  mimeType: string;
  duration: number;
}

// VideoRecorderProps - Props for the VideoRecorder component
interface VideoRecorderProps {
  onDone: (videoData: RecordedVideoData) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  width?: string | number;
  height?: string | number;
}
```

### Usage

```tsx
import { VideoRecorder, RecordedVideoData } from "@/app/components/video-recorder";

// Example usage
const MyComponent = () => {
  const handleVideoRecorded = (videoData: RecordedVideoData) => {
    console.log("Video recorded:", videoData);
    // Process the recorded video
  };

  const handleCancel = () => {
    console.log("Recording cancelled");
    // Handle cancellation
  };

  return (
    <div className="h-[400px] bg-black rounded-lg overflow-hidden">
      <VideoRecorder 
        onDone={handleVideoRecorded}
        onCancel={handleCancel}
        maxDuration={30} // 30 seconds
      />
    </div>
  );
};
```

### Features

- Automatically requests camera and microphone permissions
- Shows a live preview of the camera feed
- Records video with audio
- Displays recording time and maximum duration
- Automatically stops recording when maximum duration is reached
- Provides buttons to finish or cancel recording
- Returns a File object, URL, MIME type, and duration of the recorded video

---

## Orchestrating Components

To create a complete verification flow, you can orchestrate these components together:

1. Start with the `VerificationScreen` in "initial" state
2. When the user clicks "Record Verification Video", show the `VideoRecorder`
3. After recording, process the video and update the checklist items
4. Update the `VerificationScreen` to "update" state
5. If all items are verified, transition to "success" state

### Example Flow

```tsx
import { useState } from "react";
import { VerificationScreen, VerificationScreenState } from "@/app/components/verification-screen";
import { VideoRecorder, RecordedVideoData } from "@/app/components/video-recorder";
import { ChecklistItem } from "@/app/components/checklist";

const VerificationFlow = () => {
  const [showRecorder, setShowRecorder] = useState(false);
  const [state, setState] = useState<VerificationScreenState>("initial");
  const [items, setItems] = useState<ChecklistItem[]>([
    // Initial items
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecordClick = () => {
    setShowRecorder(true);
  };

  const handleVideoRecorded = async (videoData: RecordedVideoData) => {
    setShowRecorder(false);
    setIsLoading(true);
    
    // Process the video (e.g., send to API)
    await processVideo(videoData);
    
    // Update items based on verification results
    setItems(updatedItems);
    
    setIsLoading(false);
    setState("update");
  };

  const handleContinueClick = async () => {
    setIsLoading(true);
    
    // Perform additional verification steps
    await performAdditionalVerification();
    
    // Update items to all verified
    setItems(allVerifiedItems);
    
    setIsLoading(false);
    setState("success");
  };

  return (
    <div>
      {showRecorder ? (
        <VideoRecorder
          onDone={handleVideoRecorded}
          onCancel={() => setShowRecorder(false)}
          maxDuration={60}
        />
      ) : (
        <VerificationScreen
          title={/* title based on state */}
          description={/* description based on state */}
          checklistItems={items}
          onRecordClick={handleRecordClick}
          onContinueClick={handleContinueClick}
          isLoading={isLoading}
          state={state}
        />
      )}
    </div>
  );
};
```

This orchestration creates a complete verification flow where:
1. The user sees the initial verification screen
2. They record a video
3. The system processes the video and updates verification statuses
4. The user can continue the verification process if needed
5. Upon successful verification, they see the success screen
