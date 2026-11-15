export type JumboRqPage<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  next_page_url?: string | null;
};

export type JumboRqPageResponse<T> = JumboRqPage<T> | { data: JumboRqPage<T> } | T[];

export type JumboRqPageRequest<F> = {
  page: number;
  limit: number;
  keyword: string;
} & F;
