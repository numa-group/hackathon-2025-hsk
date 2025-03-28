import { AnalysisObservation } from "@/app/analysis/actions";

export interface ManualObservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  observations: AnalysisObservation[];
}
