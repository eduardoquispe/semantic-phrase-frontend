import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSavePhrase } from "../../hooks/save-phrase.hook";
import { useValidatePhrase } from "../../hooks/validate-phrase.hook";
import { phraseFormSchema } from "./phrase-form.schema";
import type { PhraseFormValues } from "./phrase-form.schema";

export function usePhraseForm() {
  const {
    register,
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<PhraseFormValues>({
    resolver: zodResolver(phraseFormSchema),
    defaultValues: { text: "" },
    mode: "onChange",
  });
  const validate = useValidatePhrase();
  const save = useSavePhrase();
  const inFlight = useRef(false);
  const isValidating = validate.isPending;
  const isBusy = isSubmitting || isValidating || save.isPending;

  const text = useWatch({ control, name: "text" });

  const onSubmit = async (values: PhraseFormValues) => {
    if (isBusy || inFlight.current) return;

    inFlight.current = true;
    validate.reset();
    save.reset();
    try {
      await validate.mutateAsync({ text: values.text });
    } finally {
      inFlight.current = false;
    }
  };

  const onSave = async (values: PhraseFormValues) => {
    if (isBusy || inFlight.current || !validate.data) return;

    inFlight.current = true;
    try {
      await save.mutateAsync({
        text: values.text,
        validationId: validate.data.data.validationId,
        ...(validate.data.data.requiresConfirmation ? { confirmed: true } : {}),
      });
      resetForm({ text: "" });
    } finally {
      validate.reset();
      inFlight.current = false;
    }
  };

  return {
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
  };
}
