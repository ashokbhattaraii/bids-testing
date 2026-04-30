'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { SettingsContent } from '@/components/admin/settings-content';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <SettingsContent />
      </AppShell>
    </AuthGuard>
  );
}
