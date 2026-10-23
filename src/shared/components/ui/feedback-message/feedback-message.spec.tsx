import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FeedbackMessage } from "./feedback-message.component";

it.each(["success", "warning", "error"] as const)(
  "shows %s feedback",
  (variant) => {
    render(
      <FeedbackMessage
        variant={variant}
        title="Resultado"
        description="Detalle"
      >
        <p>Información adicional</p>
      </FeedbackMessage>,
    );

    const message = screen.getByRole(variant === "error" ? "alert" : "status", {
      name: "Resultado",
    });
    expect(message).toHaveTextContent("Detalle");
    expect(message).toHaveTextContent("Información adicional");
  },
);
