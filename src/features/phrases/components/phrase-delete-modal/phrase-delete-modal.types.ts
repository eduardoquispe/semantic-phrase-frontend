import type { Phrase } from "../../interfaces/phrase.interfaces";

export interface PhraseDeleteModalProps {
  phrase: Phrase | null;
  isOpen: boolean;
  isPending: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
