import { ChecklistItem } from '../checklist/types';

export interface VerificationResultProps {
  items: ChecklistItem[];
  onContinue: () => void;
  isCompleted: boolean;
}
