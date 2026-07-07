import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  currentPage: number
  endItem: number
  onPageChange: (page: number) => void
  startItem: number
  totalItems: number
  totalPages: number
}

export function Pagination({
  currentPage,
  endItem,
  onPageChange,
  startItem,
  totalItems,
  totalPages,
}: PaginationProps) {
  if (totalItems <= 10) {
    return null
  }

  const pages = buildVisiblePages(currentPage, totalPages)

  return (
    <nav className="pagination-bar" aria-label="Pagination">
      <p>
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong>{' '}
        sur <strong>{totalItems}</strong>
      </p>

      <div className="pagination-controls">
        <button
          aria-label="Page précédente"
          className="pagination-icon-button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((page) => (
          <button
            aria-current={page === currentPage ? 'page' : undefined}
            className={page === currentPage ? 'active' : ''}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}

        <button
          aria-label="Page suivante"
          className="pagination-icon-button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  )
}

function buildVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) {
    pages.add(currentPage - 1)
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1)
  }

  return Array.from(pages).sort((first, second) => first - second)
}
