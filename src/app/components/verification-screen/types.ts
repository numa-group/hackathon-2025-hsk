import { ChecklistItem } from "../checklist/types";

export type VerificationScreenState = "initial" | "update" | "success";

export interface VerificationScreenProps {
  title: string | React.ReactNode;
  description: string;
  checklistItems: ChecklistItem[];
  onRecordClick: () => void;
  onContinueClick?: () => void;
  isLoading?: boolean;
  state?: VerificationScreenState;
}
