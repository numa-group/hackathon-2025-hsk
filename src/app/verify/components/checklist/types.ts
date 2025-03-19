export type VerificationStatus = 'pending' | 'verified' | 'unverified' | 'declined';

export interface ChecklistItem {
  id: string;
  description: string;
  status: VerificationStatus;
}
