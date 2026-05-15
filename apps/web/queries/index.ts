// Export your react-query or API queries here
//bids/apps/web/queries/index.ts

export const donorKeys = {
  all:    () => ['donors'] as const,
  lists:  () => ['donors', 'list'] as const,
  list:   (params: object) => ['donors', 'list', params] as const,
  detail: (id: string) => ['donors', 'detail', id] as const,
};
