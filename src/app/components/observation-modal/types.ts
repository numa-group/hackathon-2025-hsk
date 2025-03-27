import { AnalysisObservation } from "@/app/analysis/actions";

export interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: AnalysisObservation | null;
  videoUrl: string;
  observations: AnalysisObservation[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}
