import type { ComponentPropsWithoutRef } from 'react'

export function Input({ className = '', ...props }: ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      className={`block h-12 w-full rounded-xl border border-control-border bg-white px-4 text-[15px] text-ink outline-none placeholder:text-disabled-ink focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-focus ${className}`}
      {...props}
    />
  )
}
