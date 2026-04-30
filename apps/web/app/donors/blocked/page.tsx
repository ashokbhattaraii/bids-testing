'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { BlockedDonorsContent } from '@/components/donors/blocked-donors-content';

export default function BlockedDonorsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <BlockedDonorsContent />
      </AppShell>
    </AuthGuard>
  );
}
