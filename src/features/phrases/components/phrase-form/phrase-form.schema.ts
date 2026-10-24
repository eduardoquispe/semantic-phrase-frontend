import { z } from "zod";
import { PHRASE_MAX_LENGTH, PHRASE_MIN_LETTERS } from "./phrase-form.constants";

const EMOJI_PATTERN = /\p{Extended_Pictographic}|\p{Regional_Indicator}|‍|️/u;

export const phraseFormSchema = z.object({
  text: z
    .string({ error: "Ingresa una frase válida." })
    .regex(
      /^[^\p{Cc}]*$/u,
      "La frase debe estar en una sola línea y no contener tabulaciones ni caracteres de control.",
    )
    .trim()
    .refine((text) => Array.from(text).length >= 1, "Ingresa una frase.")
    .refine(
      (text) => Array.from(text).length <= PHRASE_MAX_LENGTH,
      `La frase debe tener como máximo ${PHRASE_MAX_LENGTH} caracteres.`,
    )
    .refine(
      (text) => !EMOJI_PATTERN.test(text),
      "La frase no puede contener emojis.",
    )
    .refine(
      (text) =>
        Array.from(text).filter((char) => /\p{L}/u.test(char)).length >=
        PHRASE_MIN_LETTERS,
      `La frase debe contener al menos ${PHRASE_MIN_LETTERS} letras.`,
    ),
});

export type PhraseFormValues = z.infer<typeof phraseFormSchema>;
