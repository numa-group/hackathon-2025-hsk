export type ChecklistItemStatus = 'unverified' | 'verified' | 'declined';

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: ChecklistItemStatus;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  description?: string;
}
