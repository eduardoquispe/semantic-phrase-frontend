import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PhraseListItem } from "./phrase-list-item.component";

const phrase = { id: "1", text: "Hola mundo", createdAt: "22/10/2026" };

it("shows the phrase and its creation date", () => {
  render(
    <ul>
      <PhraseListItem phrase={phrase} onDeleteClick={vi.fn()} />
    </ul>,
  );

  const item = screen.getByRole("listitem");
  expect(item).toHaveTextContent("“Hola mundo”");
  expect(item).toHaveTextContent("22/10/2026");
});

it("calls onDeleteClick with the phrase when Eliminar frase is clicked", async () => {
  const onDeleteClick = vi.fn();
  render(
    <ul>
      <PhraseListItem phrase={phrase} onDeleteClick={onDeleteClick} />
    </ul>,
  );
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Eliminar frase" }));

  expect(onDeleteClick).toHaveBeenCalledExactlyOnceWith(phrase);
});
