import { Button } from "../../../../shared/components/ui/button";
import { Input } from "../../../../shared/components/ui/input";
import { PhraseFormFeedback } from "../phrase-form-feedback";
import { usePhraseForm } from "./use-phrase-form.hook";

export function PhraseForm() {
  const {
    register,
    handleSubmit,
    errors,
    text,
    validate,
    save,
    isValidating,
    isBusy,
    onSubmit,
    onSave,
  } = usePhraseForm();

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
        aria-busy={isBusy}
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="px-5 py-5 sm:px-6 sm:py-6"
      >
        <label htmlFor="phrase" className="block text-sm font-semibold">
          Frase en español
        </label>
        <Input
          {...register("text", {
            onChange: () => {
              validate.reset();
              save.reset();
            },
          })}
          id="phrase"
          type="text"
          autoComplete="off"
          placeholder="Escribe una frase corta"
          aria-invalid={Boolean(errors.text)}
          aria-describedby="phrase-help"
          readOnly={isBusy}
          className="mt-2"
        />
        <div className="mt-2 flex min-h-5 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-caption">
          <span
            id="phrase-help"
            role={errors.text ? "alert" : undefined}
            className={errors.text ? "text-danger" : undefined}
          >
            {errors.text?.message ??
              "Una línea · De 1 a 280 caracteres · Al menos una palabra"}
          </span>
          <span className="tabular-nums">
            {Array.from(text.trim()).length} / 280
          </span>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isBusy}>
            <span className="inline-grid">
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1"
              >
                Validando…
              </span>
              <span className="col-start-1 row-start-1" aria-live="polite">
                {isValidating ? "Validando…" : "Validar"}
              </span>
            </span>
          </Button>
          <Button
            type="button"
            variant="save"
            disabled={isBusy || !validate.data}
            onClick={(event) => {
              void handleSubmit(onSave)(event);
            }}
          >
            {save.isPending
              ? "Guardando…"
              : validate.data?.data.requiresConfirmation
                ? "Guardar de todos modos"
                : "Guardar"}
          </Button>
        </div>
      </form>
      <PhraseFormFeedback
        response={validate.data}
        error={save.error ?? validate.error}
        isSaveSuccess={save.isSuccess}
      />
    </section>
  );
}
