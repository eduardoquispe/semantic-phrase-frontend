import { z } from "zod";

export const phraseFormSchema = z.object({
  text: z
    .string({ error: "Ingresa una frase válida." })
    .regex(
      /^(?![\s\S]*[\r\n\t\u2028\u2029])/u,
      "La frase debe estar en una sola línea y no contener tabulaciones.",
    )
    .regex(
      /^[\p{L}\p{N} ,./$%;-]*$/u,
      "Usa solo letras, números, espacios normales y estos símbolos: . / $ % , ; -",
    )
    .trim()
    .refine((text) => Array.from(text).length >= 1, "Ingresa una frase.")
    .refine(
      (text) => Array.from(text).length <= 280,
      "La frase debe tener como máximo 280 caracteres.",
    )
    .regex(/\p{L}/u, "La frase debe contener al menos una letra."),
});

export type PhraseFormValues = z.infer<typeof phraseFormSchema>;
