import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { PhraseListItem } from "./phrase-list-item.component";

it("shows the phrase and its creation date", () => {
  render(
    <ul>
      <PhraseListItem
        phrase={{ id: "1", text: "Hola mundo", createdAt: "22/10/2026" }}
      />
    </ul>,
  );

  const item = screen.getByRole("listitem");
  expect(item).toHaveTextContent("“Hola mundo”");
  expect(item).toHaveTextContent("22/10/2026");
});
