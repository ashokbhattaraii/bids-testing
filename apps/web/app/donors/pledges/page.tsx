'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { PledgesContent } from '@/components/donors/pledges-content';

export default function PledgesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <PledgesContent />
      </AppShell>
    </AuthGuard>
  );
}
