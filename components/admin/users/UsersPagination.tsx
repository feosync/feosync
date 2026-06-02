import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'

interface Props {
  page: number
  totalPages: number
  total: number
  isFetching: boolean
  onPageChange: (page: number) => void
}

export function UsersPagination({ page, totalPages, total, isFetching, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const disabled = (condition: boolean) =>
    condition ? 'pointer-events-none opacity-50' : 'cursor-pointer'

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} sur {totalPages} — {total} résultat{total > 1 ? 's' : ''}
      </p>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={disabled(page === 1 || isFetching)}
            />
          </PaginationItem>

          {page > 2 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">1</PaginationLink>
              </PaginationItem>
              {page > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            </>
          )}

          {page > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(page - 1)} className="cursor-pointer">
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>

          {page < totalPages && (
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(page + 1)} className="cursor-pointer">
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {page < totalPages - 1 && (
            <>
              {page < totalPages - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={disabled(page === totalPages || isFetching)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}