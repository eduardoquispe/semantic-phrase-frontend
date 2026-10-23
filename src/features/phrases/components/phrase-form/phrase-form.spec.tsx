// @vitest-environment jsdom
import { PhraseMatchType } from '../../interfaces/phrase-match-type.enum'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreatePhraseResponse } from "../../interfaces/phrase.interfaces";
import type { ValidatePhraseResponse } from "../../interfaces/phrase-validation.interfaces";
import { phraseService } from "../../services/phrases.service";
import { PhraseForm } from "./phrase-form.component";

vi.mock("../../services/phrases.service", () => ({
  phraseService: { validate: vi.fn(), save: vi.fn() },
}));

const validate = vi.mocked(phraseService.validate);
const save = vi.mocked(phraseService.save);
const saved: CreatePhraseResponse = {
  id: "saved-id", text: "Hola mundo", createdAt: "2026-10-22",
};
const success: ValidatePhraseResponse = {
  validationId: "validation-id",
  expiresAt: "2026-10-22T19:15:00Z",
  requiresConfirmation: false,
  match: null,
};
const phrase = {
  id: "phrase-id",
  text: "Quiero cambiar la fecha de mi consulta médica",
};

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <PhraseForm />
    </QueryClientProvider>,
  );
  return { ...view, client };
}

function expectSingleFeedback(role: "status" | "alert", title: string) {
  expect(screen.getAllByRole(role)).toHaveLength(1);
  expect(screen.getByRole(role).textContent).toContain(title);
  expect(screen.queryByRole(role === "status" ? "alert" : "status")).toBeNull();
}

beforeEach(() => {
  save.mockReset();
  save.mockResolvedValue(saved);
  validate.mockReset();
  validate.mockResolvedValue(success);
});
afterEach(cleanup);

describe("PhraseForm", () => {
  it.each([
    ['validate', 'Mensaje de la API'],
    ['validate', undefined],
    ['save', 'Mensaje de la API'],
    ['save', undefined],
  ] as const)('shows only API error messages for %s (detail=%s)', async (operation, message) => {
    const user = userEvent.setup()
    const error = {
      isAxiosError: true,
      response: { data: {
        title: 'Bad Request',
        status: 400,
        code: 'VALIDATION_ERROR',
        detail: message,
        errors: [{ field: 'text', messages: ['Este detalle no debe mostrarse'] }],
      } },
    }
    if (operation === 'validate') validate.mockRejectedValueOnce(error)
    else save.mockRejectedValueOnce(error)
    renderForm()
    const input = screen.getByLabelText('Frase en español') as HTMLInputElement
    await user.type(input, 'Hola mundo')
    fireEvent.submit(input.closest('form')!)
    if (operation === 'save') {
      await screen.findByText('Frase validada')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))
    }

    expect((await screen.findByRole('alert')).textContent).toBe(
      message ?? 'Ocurrió un error. Inténtalo de nuevo.',
    )
    expect(input.value).toBe('Hola mundo')
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('saves schema values and discards validation when the field changes', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByLabelText('Frase en español') as HTMLInputElement
    await user.type(input, '  Hola mundo  ')
    fireEvent.submit(input.closest('form')!)
    await screen.findByText('Frase validada')
    expect(validate).toHaveBeenCalledExactlyOnceWith({ text: 'Hola mundo' })

    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await screen.findByText('Frase guardada')
    expect(save).toHaveBeenCalledExactlyOnceWith({
      text: 'Hola mundo',
      validationId: success.validationId,
    })

    await user.type(input, 'Otra frase')
    fireEvent.submit(input.closest('form')!)
    await screen.findByText('Frase validada')
    await user.type(input, ' diferente')
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText('Frase validada')).toBeNull()
  })

  it("starts without feedback and shows schema errors with input focus", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();

    const input = screen.getByLabelText('Frase en español')
    expect(screen.getByText('Una línea · De 1 a 280 caracteres · Al menos una palabra')).toBeTruthy()
    fireEvent.submit(input.closest('form')!)

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Ingresa una frase.",
    );
    expect(
      screen.getByLabelText("Frase en español").getAttribute("aria-invalid"),
    ).toBe("true");
    expect(document.activeElement).toBe(
      screen.getByLabelText("Frase en español"),
    );
    expect(validate).not.toHaveBeenCalled();
    expect(screen.queryByText('Una línea · De 1 a 280 caracteres · Al menos una palabra')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id)
    await user.type(input, 'Hola mundo')
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(screen.getByText('Una línea · De 1 a 280 caracteres · Al menos una palabra')).toBeTruthy()
  });

  it("counts trimmed characters, submits with Enter and reports validation without saving", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText("Frase en español"),
      "  Hola mundo  ",
    );
    expect(screen.getByText("10 / 280")).toBeTruthy();
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(validate).toHaveBeenCalledExactlyOnceWith({ text: "Hola mundo" }),
    );
    await screen.findByText("Frase validada");
    expectSingleFeedback("status", "Frase validada");
    expect(save).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByText("Frase guardada")).toBeNull();
  });

  it("rejects invalid characters, shows loading and blocks clicks, Enter and editing while pending", async () => {
    const user = userEvent.setup();
    let finishValidation!: (response: ValidatePhraseResponse) => void;
    validate.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishValidation = resolve;
        }),
    );
    renderForm();
    const input = screen.getByLabelText("Frase en español") as HTMLInputElement;
    const submit = screen.getByRole("button", {
      name: "Validar",
    }) as HTMLButtonElement;

    await user.type(input, "Hola!");
    await user.click(submit);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Usa solo letras",
    );
    expect(validate).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "Hola");
    await user.click(submit);
    await screen.findByRole("button", { name: "Validando…" });
    expect(submit.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
    expect(input.closest("form")?.getAttribute("aria-busy")).toBe("true");
    await user.click(submit);
    await user.click(input);
    await user.keyboard("{Enter}{Enter} otro texto");
    expect(validate).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("Hola");
    expect(screen.queryByRole("status")).toBeNull();

    await act(async () => {
      finishValidation(success);
    });
    await waitFor(() => expect(submit.disabled).toBe(false));
    expect(input.readOnly).toBe(false);
    expect(input.closest("form")?.getAttribute("aria-busy")).toBe("false");
  });

  it.each([
    [
      PhraseMatchType.VECTOR,
      { type: PhraseMatchType.VECTOR, phrase, similarityScore: 0.914 },
      "Posible coincidencia semántica",
    ],
    [
      "exact",
      { type: PhraseMatchType.TEXTUAL_EXACT, phrase, similarityScore: null },
      "Coincidencia textual exacta",
    ],
  ] as const)("shows one warning for a %s match", async (_, match, title) => {
    const user = userEvent.setup();
    validate.mockResolvedValue({ ...success, requiresConfirmation: true, match });
    renderForm();
    await user.type(screen.getByLabelText("Frase en español"), "Hola");
    await user.click(screen.getByRole("button", { name: "Validar" }));

    await screen.findByText(title);
    expectSingleFeedback("status", title);
    expect(screen.getByText(`“${phrase.text}”`)).toBeTruthy();
    if (match.type === PhraseMatchType.VECTOR) {
      expect(screen.getByText("Similitud semántica · 91 %")).toBeTruthy();
    } else {
      expect(screen.getByRole("status").textContent).not.toContain("%");
    }
    expect((screen.getByRole("button", { name: "Guardar de todos modos" }) as HTMLButtonElement).disabled).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Guardar de todos modos" }));
    await screen.findByText("Frase guardada");
    expect(save).toHaveBeenCalledExactlyOnceWith({ text: "Hola", validationId: success.validationId, confirmed: true });
  });

  it("uses the confirmation flag even when a vector candidate exists", async () => {
    const user = userEvent.setup();
    validate.mockResolvedValue({
      ...success,
      match: { type: PhraseMatchType.VECTOR, phrase, similarityScore: 0.4 },
    });
    renderForm();
    await user.type(screen.getByLabelText("Frase en español"), "Hola");
    await user.click(screen.getByRole("button", { name: "Validar" }));

    await screen.findByText("Frase validada");
    expectSingleFeedback("status", "Frase validada");
    expect(screen.queryByText("Frase existente")).toBeNull();
  });

  it("preserves text after rejection and retries with Validar, clearing the error while pending", async () => {
    const user = userEvent.setup();
    validate.mockRejectedValueOnce(new Error("Network error"));
    renderForm();
    const input = screen.getByLabelText("Frase en español") as HTMLInputElement;
    await user.type(input, "Hola mundo");
    await user.click(screen.getByRole("button", { name: "Validar" }));

    await screen.findByRole("alert");
    expectSingleFeedback("alert", "Ocurrió un error. Inténtalo de nuevo.");
    expect(input.value).toBe("Hola mundo");
    expect(input.readOnly).toBe(false);

    let finishValidation!: (response: ValidatePhraseResponse) => void;
    validate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishValidation = resolve;
        }),
    );
    await user.click(screen.getByRole("button", { name: "Validar" }));
    await screen.findByRole("button", { name: "Validando…" });
    expect(screen.queryByRole("alert")).toBeNull();
    await act(async () => {
      finishValidation(success);
    });
    await screen.findByText("Frase validada");
    expect(validate).toHaveBeenCalledTimes(2);
    expectSingleFeedback("status", "Frase validada");
  });

  it.each(["success", "warning", "error"] as const)(
    "clears %s feedback when editing",
    async (outcome) => {
      const user = userEvent.setup();
      if (outcome === "error")
        validate.mockRejectedValueOnce(new Error("Network error"));
      if (outcome === "warning")
        validate.mockResolvedValueOnce({
          ...success,
          requiresConfirmation: true,
          match: { type: PhraseMatchType.VECTOR, phrase, similarityScore: 0.91 },
        });
      renderForm();
      await user.type(screen.getByLabelText("Frase en español"), "Hola");
      await user.click(screen.getByRole("button", { name: "Validar" }));
      await screen.findByRole(outcome === "error" ? "alert" : "status");

      await user.type(screen.getByLabelText("Frase en español"), " mundo");
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
      expect(validate).toHaveBeenCalledTimes(1);
      expect((screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement).disabled).toBe(true);
    },
  );

  it("clears a previous successful result when starting another validation", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Frase en español"), "Hola");
    await user.click(screen.getByRole("button", { name: "Validar" }));
    await screen.findByText("Frase validada");

    let finishValidation!: (response: ValidatePhraseResponse) => void;
    validate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishValidation = resolve;
        }),
    );
    await user.click(screen.getByRole("button", { name: "Validar" }));
    await screen.findByRole("button", { name: "Validando…" });
    expect(screen.queryByRole("status")).toBeNull();
    await act(async () => {
      finishValidation(success);
    });
    await screen.findByText("Frase validada");
    expectSingleFeedback("status", "Frase validada");
  });
});


describe('PhraseForm saving', () => {
  async function validateText() {
    const user = userEvent.setup()
    const view = renderForm()
    const input = screen.getByLabelText('Frase en español') as HTMLInputElement
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
    await user.type(input, '  Hola mundo  ')
    await user.click(screen.getByRole('button', { name: 'Validar' }))
    await screen.findByText('Frase validada')
    return { user, input, ...view }
  }

  it('saves the exact submitted text, invalidates all phrase pages and clears the form', async () => {
    const { user, input, client } = await validateText()
    client.setQueryData(['phrases', { page: 1 }], { data: [] })
    client.setQueryData(['phrases', { page: 2 }], { data: [] })
    client.setQueryData(['other'], {})
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await screen.findByText('Frase guardada')
    expect(save).toHaveBeenCalledExactlyOnceWith({ text: 'Hola mundo', validationId: success.validationId })
    expect(client.getQueryState(['phrases', { page: 1 }])?.isInvalidated).toBe(true)
    expect(client.getQueryState(['phrases', { page: 2 }])?.isInvalidated).toBe(true)
    expect(client.getQueryState(['other'])?.isInvalidated).toBe(false)
    expect(input.value).toBe('')
    expectSingleFeedback('status', 'Frase guardada')
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
    await user.type(input, 'Otra frase')
    expect(screen.queryByRole('status')).toBeNull()
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('blocks duplicate saves, validation, Enter and editing while saving', async () => {
    let finishSave!: (response: CreatePhraseResponse) => void
    save.mockImplementation(() => new Promise(resolve => { finishSave = resolve }))
    const { user, input } = await validateText()
    await user.dblClick(screen.getByRole('button', { name: 'Guardar' }))
    const saving = await screen.findByRole('button', { name: 'Guardando…' }) as HTMLButtonElement
    expect(saving.disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Validar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(input.readOnly).toBe(true)
    expect(input.closest('form')?.getAttribute('aria-busy')).toBe('true')
    await user.click(input)
    await user.keyboard('{Enter}{Enter} otro texto')
    expect(input.value).toBe('  Hola mundo  ')
    expect(validate).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledTimes(1)
    await act(async () => finishSave(saved))
    await screen.findByText('Frase guardada')
    expect(input.readOnly).toBe(false)
  })

  it('requires a new validation after editing, even if the original text is restored', async () => {
    const { user, input } = await validateText()
    await user.type(input, ' otra')
    await user.clear(input)
    await user.type(input, '  Hola mundo  ')
    const button = screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await user.click(button)
    expect(save).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Validar' }))
    await screen.findByText('Frase validada')
    expect(button.disabled).toBe(false)
  })

  it.each(['VALIDATION_EXPIRED', 'INVALID_VALIDATION_ID', 'VALIDATION_ALREADY_USED', 'PHRASE_MISMATCH', 'CONFIRMATION_REQUIRED', 'NETWORK_ERROR'])(
    'preserves text without retry or automatic save after %s', async code => {
      save.mockRejectedValueOnce({ response: { data: { code } } })
      const { user, input, client } = await validateText()
      client.setDefaultOptions({ mutations: { retry: 2, retryDelay: 0 } })
      client.setQueryData(['phrases'], { data: [] })
      await user.click(screen.getByRole('button', { name: 'Guardar' }))
      await screen.findByRole('alert')
      expectSingleFeedback('alert', 'Ocurrió un error. Inténtalo de nuevo.')
      expect(input.value).toBe('  Hola mundo  ')
      expect(input.readOnly).toBe(false)
      expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
      expect(client.getQueryState(['phrases'])?.isInvalidated).toBe(false)
      expect(save).toHaveBeenCalledTimes(1)
      await user.click(screen.getByRole('button', { name: 'Validar' }))
      await screen.findByText('Frase validada')
      expect(save).toHaveBeenCalledTimes(1)
      await user.click(screen.getByRole('button', { name: 'Guardar' }))
      await screen.findByText('Frase guardada')
      expect(save).toHaveBeenCalledTimes(2)
    },
  )
})
