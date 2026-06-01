import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'

interface PostsPaginationProps {
  page: number
  totalPages: number
  total: number
  isFetching: boolean
  onPageChange: (p: number) => void
}

export function PostsPagination({ page, totalPages, total, isFetching, onPageChange }: PostsPaginationProps) {
  if (totalPages <= 1) return null

  const disabled = (cond: boolean) =>
    cond ? 'pointer-events-none opacity-50' : 'cursor-pointer'

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between pt-2">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {page} / {totalPages} — {total} résultat{total > 1 ? 's' : ''}
      </p>
      <div className="order-1 sm:order-2 overflow-x-auto max-w-full">
        <Pagination>
          <PaginationContent className="flex-nowrap">

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
    </div>
  )
}