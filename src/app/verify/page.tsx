"use client";
import { VerificationScreen } from "../components/verification-screen";
import { ChecklistItem } from "../components/checklist";

// Mock data - in a real app, this would come from an API
const initialChecklistItems: ChecklistItem[] = [
  {
    id: "1",
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "unverified",
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
    status: "unverified",
  },
];

export default function VerifyPage() {
  return (
    <VerificationScreen
      title="Video Verification"
      description="Complete the verification process by recording a short video"
      checklistItems={initialChecklistItems}
      onRecordClick={() => {}}
    />
  );
}
