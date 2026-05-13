'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}
