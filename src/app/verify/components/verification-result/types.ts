import { ChecklistItem } from '../checklist/types';

export interface VerificationResultProps {
  items: ChecklistItem[];
  onReset: () => void;
}
