'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { SettingsContent } from '@/components/admin/settings-content';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <SettingsContent />
      </AppShell>
    </AuthGuard>
  );
}
