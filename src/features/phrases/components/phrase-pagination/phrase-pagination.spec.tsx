import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PhrasePagination } from "./phrase-pagination.component";

it("hides the back button on the first page and advances", async () => {
  const onPageChange = vi.fn();
  render(
    <PhrasePagination page={1} totalPages={3} onPageChange={onPageChange} />,
  );

  expect(
    screen.queryByRole("button", { name: /Atrás/ }),
  ).not.toBeInTheDocument();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /Siguiente/ }));
  expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2);
});

it("goes back from an intermediate page", async () => {
  const onPageChange = vi.fn();
  render(
    <PhrasePagination page={2} totalPages={3} onPageChange={onPageChange} />,
  );

  await userEvent.setup().click(screen.getByRole("button", { name: /Atrás/ }));
  expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
});

it("disables advancing on the last page", async () => {
  const onPageChange = vi.fn();
  render(
    <PhrasePagination page={3} totalPages={3} onPageChange={onPageChange} />,
  );

  const next = screen.getByRole("button", { name: /Siguiente/ });
  expect(next).toBeDisabled();
  await userEvent.setup().click(next);
  expect(onPageChange).not.toHaveBeenCalled();
});
