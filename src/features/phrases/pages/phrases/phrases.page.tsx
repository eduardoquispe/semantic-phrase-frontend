import { PhraseForm } from '../../components/phrase-form'
import { PhraseList, phraseListExamples } from '../../components/phrase-list'

export function PhrasesPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 sm:px-8 sm:pt-5 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M5 7.5h14M5 12h10M5 16.5h13" />
              <path d="M18.5 10.5 21 12l-2.5 1.5" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-[-0.02em]">Frases</span>
        </div>
        <p className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-secondary">Lista compartida · Español</p>
      </header>
      <main>
        <section aria-labelledby="page-title" className="pt-5 pb-5 sm:pt-6 sm:pb-6">
          <div className="max-w-3xl">
            <h1 id="page-title" className="text-2xl leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-3xl">Cada idea, una frase.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-[15px]">Comprueba si tu frase se parece a otra antes de guardarla. Si encontramos una posible coincidencia, tú decides.</p>
          </div>
        </section>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
          <PhraseForm />
          <PhraseList phrases={phraseListExamples} />
        </div>
      </main>
    </div>
  )
}
