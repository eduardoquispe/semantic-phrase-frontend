import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
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

it("runs the selected action", async () => {
  const onClick = vi.fn();
  render(
    <FeedbackMessage
      variant="error"
      title="Error"
      actions={[{ label: "Reintentar", onClick }]}
    />,
  );

  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Reintentar" }));
  expect(onClick).toHaveBeenCalledTimes(1);
});
