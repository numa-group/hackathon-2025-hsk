import { ChecklistItem } from "../checklist/types";

export interface VerificationScreenProps {
  title: string;
  description: string;
  checklistItems: ChecklistItem[];
  onRecordClick: () => void;
  isLoading?: boolean;
}
