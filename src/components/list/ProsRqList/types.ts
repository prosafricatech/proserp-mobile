export type ProsRqPage<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  next_page_url?: string | null;
};

export type ProsRqPageResponse<T> = ProsRqPage<T> | { data: ProsRqPage<T> } | T[];

export type ProsRqPageRequest<F> = {
  page: number;
  limit: number;
  keyword: string;
} & F;
