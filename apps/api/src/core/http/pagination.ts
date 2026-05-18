const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type PaginationInput = {
  page?: string | number;
  limit?: string | number;
};

export type Pagination = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

function toPositiveInt(value: string | number | undefined, fallback: number): number {
  if (value == null) return fallback;

  const parsed =
    typeof value === 'number'
      ? value
      : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parsePagination(input: PaginationInput): Pagination {
  const page = toPositiveInt(input.page, DEFAULT_PAGE);
  const limit = Math.min(toPositiveInt(input.limit, DEFAULT_LIMIT), MAX_LIMIT);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const safeTotal = Math.max(0, total);
  const totalPages = Math.max(1, Math.ceil(safeTotal / limit));

  return {
    page,
    limit,
    total: safeTotal,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
