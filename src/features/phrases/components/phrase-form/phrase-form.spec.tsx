// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ValidatePhraseResponse } from "../../interfaces/phrase.interfaces";
import { phraseService } from "../../services/phrases.service";
import { PhraseForm } from "./phrase-form.component";

vi.mock("../../services/phrases.service", () => ({
  phraseService: { validate: vi.fn() },
}));

const validate = vi.mocked(phraseService.validate);
const success: ValidatePhraseResponse = {
  data: {
    validationId: "validation-id",
    expiresAt: "2026-10-22T19:15:00Z",
    requiresConfirmation: false,
    match: null,
  },
};
const phrase = {
  id: "phrase-id",
  text: "Quiero cambiar la fecha de mi consulta médica",
};

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PhraseForm />
    </QueryClientProvider>,
  );
}

function expectSingleFeedback(role: "status" | "alert", title: string) {
  expect(screen.getAllByRole(role)).toHaveLength(1);
  expect(screen.getByRole(role).textContent).toContain(title);
  expect(screen.queryByRole(role === "status" ? "alert" : "status")).toBeNull();
  expect(
    (screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
}

beforeEach(() => {
  validate.mockReset();
  validate.mockResolvedValue(success);
});
afterEach(cleanup);

describe("PhraseForm", () => {
  it("starts without feedback and shows schema errors with input focus", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Validar" }));

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
    expect(screen.getByText("La frase todavía no se guardó.")).toBeTruthy();
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
      "vector",
      { type: "vector", phrase, similarityScore: 0.914 },
      "Posible coincidencia semántica",
    ],
    [
      "exact",
      { type: "textual_exact", phrase, similarityScore: null },
      "Coincidencia textual exacta",
    ],
  ] as const)("shows one warning for a %s match", async (_, match, title) => {
    const user = userEvent.setup();
    validate.mockResolvedValue({
      data: { ...success.data, requiresConfirmation: true, match },
    });
    renderForm();
    await user.type(screen.getByLabelText("Frase en español"), "Hola");
    await user.click(screen.getByRole("button", { name: "Validar" }));

    await screen.findByText(title);
    expectSingleFeedback("status", title);
    expect(screen.getByText(`“${phrase.text}”`)).toBeTruthy();
    if (match.type === "vector") {
      expect(screen.getByText("Similitud semántica · 91 %")).toBeTruthy();
    } else {
      expect(screen.getByRole("status").textContent).not.toContain("%");
    }
    expect(
      screen.queryByRole("button", { name: "Guardar de todos modos" }),
    ).toBeNull();
  });

  it("uses the confirmation flag even when a vector candidate exists", async () => {
    const user = userEvent.setup();
    validate.mockResolvedValue({
      data: {
        ...success.data,
        match: { type: "vector", phrase, similarityScore: 0.4 },
      },
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
    expectSingleFeedback("alert", "No pudimos validar la frase");
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
          data: {
            ...success.data,
            requiresConfirmation: true,
            match: { type: "vector", phrase, similarityScore: 0.91 },
          },
        });
      renderForm();
      await user.type(screen.getByLabelText("Frase en español"), "Hola");
      await user.click(screen.getByRole("button", { name: "Validar" }));
      await screen.findByRole(outcome === "error" ? "alert" : "status");

      await user.type(screen.getByLabelText("Frase en español"), " mundo");
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
      expect(validate).toHaveBeenCalledTimes(1);
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
