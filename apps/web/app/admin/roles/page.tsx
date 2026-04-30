'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { RolesContent } from '@/components/admin/roles-content';

export default function RolesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <RolesContent />
      </AppShell>
    </AuthGuard>
  );
}
