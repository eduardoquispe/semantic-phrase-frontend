import type { PhraseListItemProps } from "./phrase-list-item.types";

export function PhraseListItem({ phrase }: PhraseListItemProps) {
  return (
    <li className="px-5 py-3 sm:px-6 sm:py-4">
      <p className="text-lg leading-snug font-medium tracking-[-0.015em] [overflow-wrap:anywhere]">
        “{phrase.text}”
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-caption">{phrase.createdAt}</span>
      </div>
    </li>
  );
}
