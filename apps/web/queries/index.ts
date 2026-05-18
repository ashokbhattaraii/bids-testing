export * from './request';
export * from './hospital';

export const donorKeys = {
  all: () => ['donors'] as const,
  lists: () => ['donors', 'list'] as const,
  list: (params: object) => ['donors', 'list', params] as const,
  detail: (id: string) => ['donors', 'detail', id] as const,
};
