'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { RolesContent } from '@/components/admin/roles-content';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function RolesPage() {
  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <RolesContent />
      </AppShell>
    </AuthGuard>
  );
}
