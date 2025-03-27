import { ChecklistItem } from "./checklist";

// Mock data for demonstration
export const demoChecklistItems: ChecklistItem[] = [
  {
    title: "Valid ID Document",
    description: "Show the front and back of your government-issued ID",
    status: "verified",
  },
  {
    title: "Face Verification",
    description: "Record a clear video of your face",
    status: "unverified",
  },
  {
    title: "Proof of Address",
    description: "Show a utility bill or bank statement with your address",
    status: "declined",
  },
];

// Checklist variants
export const checklistVariants = {
  allVerified: [
    {
      title: "Valid ID Document",
      description: "Show the front and back of your government-issued ID",
      status: "verified",
    },
    {
      id: "2",
      title: "Face Verification",
      description: "Record a clear video of your face",
      status: "verified",
    },
    {
      id: "3",
      title: "Proof of Address",
      description: "Show a utility bill or bank statement with your address",
      status: "verified",
    },
  ] as ChecklistItem[],

  mixed: [
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
      title: "Proof of Address",
      description: "Show a utility bill or bank statement with your address",
      status: "declined",
    },
  ] as ChecklistItem[],

  noneVerified: [
    {
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
  ] as ChecklistItem[],
};
