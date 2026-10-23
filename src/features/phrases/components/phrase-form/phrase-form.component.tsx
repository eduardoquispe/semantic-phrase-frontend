import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../../../shared/components/ui/button";
import { Input } from "../../../../shared/components/ui/input";
import { phraseFormSchema } from "./phrase-form.schema";
import type { PhraseFormValues } from "./phrase-form.schema";
import type { PhraseFormProps } from "./phrase-form.types";
import { FeedbackMessage } from "../../../../shared/components/ui/feedback-message";

export function PhraseForm({ onValidate }: PhraseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhraseFormValues>({
    resolver: zodResolver(phraseFormSchema),
    defaultValues: { text: "" },
    mode: "onChange",
  });
  const text = useWatch({ control, name: "text" });

  return (
    <section
      aria-labelledby="compose-title"
      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white"
    >
      <div className="border-b border-divider px-5 py-4 sm:px-6 sm:py-5">
        <h2 id="compose-title" className="text-lg font-bold tracking-[-0.02em]">
          Nueva frase
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          La validación revisa frases guardadas; no guarda la nueva frase.
        </p>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit((values) => onValidate?.(values))}
        aria-busy={isSubmitting}
        className="px-5 py-5 sm:px-6 sm:py-6"
      >
        <label htmlFor="phrase" className="block text-sm font-semibold">
          Frase en español
        </label>
        <Input
          {...register("text")}
          id="phrase"
          type="text"
          autoComplete="off"
          placeholder="Escribe una frase corta"
          aria-invalid={Boolean(errors.text)}
          aria-describedby={
            errors.text ? "phrase-help phrase-error" : "phrase-help"
          }
          readOnly={isSubmitting}
          className="mt-2"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-caption">
          <span id="phrase-help">
            Una línea · De 1 a 280 caracteres · Al menos una palabra
          </span>
          <span className="tabular-nums">
            {Array.from(text.trim()).length} / 280
          </span>
        </div>
        <div className="mt-2 min-h-5 text-sm text-danger">
          {errors.text && (
            <p id="phrase-error" role="alert">
              {errors.text.message}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isSubmitting}>
            Validar
          </Button>
          <Button type="button" variant="save" disabled>
            Guardar
          </Button>
        </div>
      </form>
      <div className="border-t border-divider px-5 py-4 sm:px-6 sm:py-5">
        <FeedbackMessage
          variant="success"
          title="Frase guardada"
          description="Ya aparece al principio de la lista compartida."
        />
        <FeedbackMessage
          variant="error"
          title="No pudimos validar la frase"
          description="Tu texto sigue aquí. Intenta validarlo de nuevo."
          actions={[
            {
              label: "Reintentar validación",
              onClick: () => console.log("Reintentar validación"),
            },
          ]}
        />
        <FeedbackMessage
          variant="warning"
          title="Posible coincidencia semántica"
          actions={[
            {
              label: "Guardar de todos modos",
              emphasis: "primary",
              onClick: () => console.log("Guardar de todos modos"),
            },
            {
              label: "Cancelar",
              emphasis: "secondary",
              onClick: () => console.log("Cancelar"),
            },
          ]}
        >
          <p className="inline-block rounded-full bg-warning-badge px-2.5 py-1 text-xs font-bold text-warning-action tabular-nums">
            Similitud semántica · 91 %
          </p>
          <p className="mt-3 text-xs font-bold">Frase existente</p>
          <p className="mt-1 text-lg leading-snug font-medium tracking-[-0.015em]">
            “Quiero cambiar la fecha de mi consulta médica”
          </p>
          <p className="mt-2 text-xs leading-5">
            El puntaje indica similitud; tú decides si es un duplicado.
          </p>
        </FeedbackMessage>
      </div>
    </section>
  );
}
