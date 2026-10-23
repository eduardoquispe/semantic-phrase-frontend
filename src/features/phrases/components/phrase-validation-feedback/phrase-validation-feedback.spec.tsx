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
    screen.getByRole("status", {
      name: "No encontramos una posible coincidencia.",
    }),
  ).toHaveTextContent("Puedes guardar la frase si deseas añadirla a la lista.");
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

  const message = screen.getByRole("status", {
    name: "Posible coincidencia semántica",
  });
  expect(message).toHaveTextContent("“Hola mundo”");
  expect(message).not.toHaveTextContent("Se requiere tu confirmación");
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

  const message = screen.getByRole("status", {
    name: "Posible coincidencia textual",
  });
  expect(message).toHaveTextContent("“Hola mundo”");
  expect(screen.getByText("Coincidencia textual · 100 %")).toBeInTheDocument();
  expect(
    screen.getByText("Comparación textual, sin intervención del modelo de IA."),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Similitud semántica/)).not.toBeInTheDocument();
});
