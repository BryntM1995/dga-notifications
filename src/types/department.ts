export type Department = {
  id: number;
  name: string;
  status: 0 | 1;
  subdirection_id: number;
  management_id: number;
  subdirection_name?: string;
  management_name?: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
};
