import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Button } from "./button.component";

it("renders a button and handles clicks", async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Guardar</Button>);

  const button = screen.getByRole("button", { name: "Guardar" });
  expect(button).toHaveAttribute("type", "button");
  await userEvent.setup().click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});

it("does not handle clicks when disabled", async () => {
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Guardar
    </Button>,
  );

  const button = screen.getByRole("button", { name: "Guardar" });
  expect(button).toBeDisabled();
  await userEvent.setup().click(button);
  expect(onClick).not.toHaveBeenCalled();
});
