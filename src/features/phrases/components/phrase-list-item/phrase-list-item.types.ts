import type { Phrase } from "../../interfaces/phrase.interfaces";

export interface PhraseListItemProps {
  phrase: Phrase;
  onDeleteClick: (phrase: Phrase) => void;
}
