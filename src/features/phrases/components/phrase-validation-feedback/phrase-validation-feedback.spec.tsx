import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { ValidatePhraseResponse } from "../../interfaces/phrase-validation.interfaces";
import { PhraseMatchType } from "../../interfaces/phrase-match-type.enum";
import { PhraseValidationFeedback } from "./phrase-validation-feedback.component";

const response: ValidatePhraseResponse = {
  validationId: "validation-id",
  expiresAt: "2026-10-22T19:15:00Z",
  requiresConfirmation: false,
  match: null,
};

it("renders nothing without a response", () => {
  const { container } = render(
    <PhraseValidationFeedback response={undefined} />,
  );
  expect(container).toBeEmptyDOMElement();
});

it("shows successful validation without confirmation", () => {
  render(<PhraseValidationFeedback response={response} />);
  expect(
    screen.getByRole("status", { name: "Frase validada" }),
  ).toHaveTextContent("No se encontró ninguna coincidencia.");
});

it("shows the matching phrase and rounded semantic score", () => {
  render(
    <PhraseValidationFeedback
      response={{
        ...response,
        requiresConfirmation: true,
        match: {
          type: PhraseMatchType.VECTOR,
          phrase: { id: "1", text: "Hola mundo" },
          similarityScore: 0.914,
        },
      }}
    />,
  );

  expect(
    screen.getByRole("status", { name: "Posible coincidencia semántica" }),
  ).toHaveTextContent("Se requiere tu confirmación");
  expect(screen.getByText("“Hola mundo”")).toBeInTheDocument();
  expect(screen.getByText("Similitud semántica · 91 %")).toBeInTheDocument();
});

it("shows an exact match without a semantic score", () => {
  render(
    <PhraseValidationFeedback
      response={{
        ...response,
        requiresConfirmation: true,
        match: {
          type: PhraseMatchType.TEXTUAL_EXACT,
          phrase: { id: "1", text: "Hola mundo" },
          similarityScore: null,
        },
      }}
    />,
  );

  expect(
    screen.getByRole("status", { name: "Coincidencia textual exacta" }),
  ).toHaveTextContent("“Hola mundo”");
  expect(screen.queryByText(/Similitud semántica/)).not.toBeInTheDocument();
});
