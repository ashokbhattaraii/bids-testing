'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { AdminContent } from '@/components/admin/admin-content';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function AdminPage() {
  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <AdminContent />
      </AppShell>
    </AuthGuard>
  );
}
