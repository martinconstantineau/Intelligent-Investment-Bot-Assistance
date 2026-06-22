/**
 * Fixes Issue #7: Unbounded Array Rendering
 * Pagination utilities for large lists
 */

export type PaginationState = {
  page: number;
  pageSize: number;
};

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(itemCount: number, pageSize: number): number {
  return Math.ceil(itemCount / pageSize);
}

export function canPageNext(page: number, totalPages: number): boolean {
  return page < totalPages;
}

export function canPagePrev(page: number): boolean {
  return page > 1;
}
