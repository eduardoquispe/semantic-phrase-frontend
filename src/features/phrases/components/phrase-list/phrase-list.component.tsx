import { PhrasePagination } from '../phrase-pagination'
import { PhraseListItem } from '../phrase-list-item'
import type { PhraseListProps } from './phrase-list.types'

export function PhraseList({ phrases }: PhraseListProps) {
  return (
    <section aria-labelledby="list-title" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-divider px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="list-title" className="text-lg font-bold tracking-[-0.02em]">Frases guardadas</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Las más recientes aparecen primero.</p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand tabular-nums">{phrases.length} frases</span>
      </div>
      <ul tabIndex={0} aria-label="Frases guardadas, lista desplazable" className="max-h-[360px] divide-y divide-divider overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand">
        {phrases.map((phrase) => <PhraseListItem key={phrase.text} phrase={phrase} />)}
      </ul>
      <div className="border-t border-divider bg-footer px-5 py-3 sm:px-6">
        <p className="text-xs leading-5 text-muted">Esta lista es compartida: cualquier persona puede ver y eliminar sus frases.</p>
      </div>
      <PhrasePagination page={1} totalPages={1} />
    </section>
  )
}
