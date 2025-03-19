import { ChecklistItem } from "../checklist/types";

export interface VideoRecorderProps {
  onVideoProcessed: (results: { items: ChecklistItem[] }) => void;
  onCancel: () => void;
  onSubmit: () => void;
}
