export interface PhrasePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
