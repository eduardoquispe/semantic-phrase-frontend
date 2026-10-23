import { PhraseMatchType } from "../../interfaces/phrase-match-type.enum";

export const PHRASE_MATCH_TITLES: Record<PhraseMatchType, string> = {
  [PhraseMatchType.VECTOR]: "Posible coincidencia semántica",
  [PhraseMatchType.TEXTUAL_EXACT]: "Posible coincidencia textual",
};
