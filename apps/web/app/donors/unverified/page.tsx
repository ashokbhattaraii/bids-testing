'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { UnverifiedDonorsContent } from '@/components/donors/unverified-donors-content';

export default function UnverifiedDonorsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <UnverifiedDonorsContent />
      </AppShell>
    </AuthGuard>
  );
}
