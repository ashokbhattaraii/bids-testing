'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { DonorsContent } from '@/components/donors/donors-content';

export default function DonorsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DonorsContent />
      </AppShell>
    </AuthGuard>
  );
}
