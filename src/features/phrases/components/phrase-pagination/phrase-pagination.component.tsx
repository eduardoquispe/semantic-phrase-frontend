import { Button } from "../../../../shared/components/ui/button";
import type { PhrasePaginationProps } from "./phrase-pagination.types";

export function PhrasePagination({
  page,
  totalPages,
  onPageChange,
}: PhrasePaginationProps) {
  return (
    <nav
      aria-label="Paginación de frases"
      className="flex flex-wrap justify-end gap-2 border-t border-divider px-5 py-3 sm:px-6"
    >
      {page > 1 && (
        <Button onClick={() => onPageChange(page - 1)}>← Atrás</Button>
      )}
      <Button
        disabled={page >= totalPages}
        className="disabled:bg-disabled disabled:text-disabled-ink"
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  );
}
