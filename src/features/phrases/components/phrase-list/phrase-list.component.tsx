import { useState } from "react";
import { PhrasePagination } from "../phrase-pagination";
import { PhraseListItem } from "../phrase-list-item";
import { PhraseDeleteModal } from "../phrase-delete-modal";
import { usePhrasesList } from "../../hooks/phrases-list.hook";
import { useDeletePhrase } from "../../hooks/delete-phrase.hook";
import type { Phrase } from "../../interfaces/phrase.interfaces";

export function PhraseList() {
  const [page, setPage] = useState(1);
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const { data } = usePhrasesList({ page, limit: 20 });
  const { data: phrases = [], meta } = data ?? {};

  const phraseId = phrase?.id ?? "";

  const { isPending, error, confirm, reset } = useDeletePhrase(phraseId, {
    onDeleted: () => setPhrase(null),
  });

  const handleDeleteClick = (phrase: Phrase) => {
    reset();
    setPhrase(phrase);
  };

  const handleCancel = () => {
    reset();
    setPhrase(null);
  };

  return (
    <section
      aria-labelledby="list-title"
      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-divider px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="list-title" className="text-lg font-bold tracking-[-0.02em]">
            Frases guardadas
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Las más recientes aparecen primero.
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand tabular-nums">
          {meta?.total} frases
        </span>
      </div>
      <ul
        tabIndex={0}
        aria-label="Frases guardadas, lista desplazable"
        className="max-h-[360px] divide-y divide-divider overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        {phrases.map((phrase) => (
          <PhraseListItem
            key={phrase.id}
            phrase={phrase}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </ul>
      <div className="border-t border-divider bg-footer px-5 py-3 sm:px-6">
        <p className="text-xs leading-5 text-muted">
          Esta lista es compartida: cualquier persona puede ver y eliminar sus
          frases.
        </p>
      </div>
      <PhrasePagination
        page={meta?.page || 1}
        totalPages={meta?.totalPages || 1}
        onPageChange={setPage}
      />
      <PhraseDeleteModal
        phrase={phrase}
        isOpen={!!phrase}
        isPending={isPending}
        error={error}
        onConfirm={confirm}
        onCancel={handleCancel}
      />
    </section>
  );
}
