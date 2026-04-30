'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { RequestsContent } from '@/components/requests/requests-content';

export default function RequestsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <RequestsContent />
      </AppShell>
    </AuthGuard>
  );
}
