'use client';

import { NewRequestPageContent } from './new-request-page';

export function EditRequestPageContent({ id }: { id: string }) {
  return <NewRequestPageContent mode="edit" requestId={id} />;
}
