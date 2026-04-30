'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { AdminContent } from '@/components/admin/admin-content';

export default function AdminPage() {
  return (
    <AuthGuard>
      <AppShell>
        <AdminContent />
      </AppShell>
    </AuthGuard>
  );
}
