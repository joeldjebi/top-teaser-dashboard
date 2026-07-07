import { useEffect, useMemo, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 10

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [items])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize

    return items.slice(start, start + pageSize)
  }, [currentPage, items, pageSize])

  return {
    currentPage,
    endItem: totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems),
    pageSize,
    paginatedItems,
    setCurrentPage,
    startItem: totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    totalItems,
    totalPages,
  }
}
