import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'

export function PhraseForm() {
  return (
    <section aria-labelledby="compose-title" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-divider px-5 py-4 sm:px-6 sm:py-5">
        <h2 id="compose-title" className="text-lg font-bold tracking-[-0.02em]">Nueva frase</h2>
        <p className="mt-1 text-sm leading-6 text-muted">La validación revisa frases guardadas; no guarda la nueva frase.</p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <label htmlFor="phrase" className="block text-sm font-semibold">Frase en español</label>
        <Input id="phrase" type="text" autoComplete="off" placeholder="Escribe una frase corta" aria-describedby="phrase-help" className="mt-2" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-caption">
          <span id="phrase-help">Una línea · De 1 a 280 caracteres · Al menos una palabra</span>
          <span className="tabular-nums">0 / 280</span>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button>Validar</Button>
          <Button variant="save" disabled>Guardar</Button>
        </div>
      </div>
    </section>
  )
}
