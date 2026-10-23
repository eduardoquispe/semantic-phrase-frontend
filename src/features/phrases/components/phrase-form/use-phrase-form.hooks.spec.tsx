import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { phraseService } from "../../services/phrases.service";
import { usePhraseForm } from "./use-phrase-form.hook";

vi.mock("../../services/phrases.service", () => ({
  phraseService: { validate: vi.fn(), save: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  return renderHook(usePhraseForm, { wrapper: Wrapper });
}

it("starts with empty text and prevents saving without validation", async () => {
  const { result } = setup();
  expect(result.current.text).toBe("");
  expect(result.current.isBusy).toBe(false);

  await act(async () => {
    await result.current.onSave({ text: "Hola mundo" });
  });

  expect(phraseService.save).not.toHaveBeenCalled();
});

it.each([false, true])(
  "validates before saving with confirmation=%s",
  async (requiresConfirmation) => {
    vi.mocked(phraseService.validate).mockResolvedValue({
      validationId: "validation-id",
      expiresAt: "2026-10-22T19:15:00Z",
      requiresConfirmation,
      match: null,
    });
    vi.mocked(phraseService.save).mockResolvedValue({
      id: "phrase-id",
      text: "Hola mundo",
      createdAt: "22/10/2026",
    });
    const { result } = setup();

    await act(async () => {
      await result.current.onSubmit({ text: "Hola mundo" });
    });
    await waitFor(() => expect(result.current.validate.isSuccess).toBe(true));
    expect(phraseService.validate).toHaveBeenCalledExactlyOnceWith({
      text: "Hola mundo",
    });
    expect(phraseService.save).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.onSave({ text: "Hola mundo" });
    });

    await waitFor(() => expect(result.current.save.isSuccess).toBe(true));
    expect(phraseService.save).toHaveBeenCalledExactlyOnceWith({
      text: "Hola mundo",
      validationId: "validation-id",
      ...(requiresConfirmation ? { confirmed: true } : {}),
    });
    expect(result.current.validate.data).toBeUndefined();
    expect(result.current.text).toBe("");
  },
);

it("exposes validation failures and prevents saving afterward", async () => {
  const error = new Error("Validation failed");
  vi.mocked(phraseService.validate).mockRejectedValue(error);
  const { result } = setup();

  await act(async () => {
    await result.current.onSubmit({ text: "Hola mundo" });
  });
  await waitFor(() => expect(result.current.validate.isError).toBe(true));
  await act(async () => {
    await result.current.onSave({ text: "Hola mundo" });
  });

  expect(result.current.validate.error).toBe(error);
  expect(result.current.isBusy).toBe(false);
  expect(phraseService.save).not.toHaveBeenCalled();
});
