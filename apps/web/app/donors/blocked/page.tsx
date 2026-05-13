'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { BlockedDonorsContent } from '@/components/donors/blocked-donors-content';
import { usePluginStore } from '@/lib/plugins/plugin-store';
import { PluginDisabledMessage } from '@/components/plugin-disabled-message';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function BlockedDonorsPage() {
  const { isEnabled } = usePluginStore();
  if (!isEnabled('donor')) {
    return (
      <AuthGuard>
        <AppShell plugins={plugins}>
          <PluginDisabledMessage pluginId="donor" pluginLabel="Donor Management" />
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <BlockedDonorsContent />
      </AppShell>
    </AuthGuard>
  );
}
