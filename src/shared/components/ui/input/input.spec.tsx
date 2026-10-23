import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { Input } from "./input.component";

it("accepts text through a labeled input", async () => {
  render(<Input aria-label="Frase" placeholder="Escribe aquí" />);

  const input = screen.getByRole("textbox", { name: "Frase" });
  expect(input).toHaveAttribute("placeholder", "Escribe aquí");
  await userEvent.setup().type(input, "Hola mundo");
  expect(input).toHaveValue("Hola mundo");
});

it("does not accept text when disabled", async () => {
  render(<Input aria-label="Frase" disabled />);

  const input = screen.getByRole("textbox", { name: "Frase" });
  expect(input).toBeDisabled();
  await userEvent.setup().type(input, "Hola");
  expect(input).toHaveValue("");
});
