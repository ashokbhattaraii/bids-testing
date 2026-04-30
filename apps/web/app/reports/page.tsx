'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { ReportsContent } from '@/components/reports/reports-content';

export default function ReportsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ReportsContent />
      </AppShell>
    </AuthGuard>
  );
}
