'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { RequestsContent } from '@/components/requests/requests-content';
import { usePluginStore } from '@/lib/plugins/plugin-store';
import { PluginDisabledMessage } from '@/components/plugin-disabled-message';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function RequestsPage() {
  const { isEnabled } = usePluginStore();
  if (!isEnabled('bids')) {
    return (
      <AuthGuard>
        <AppShell plugins={plugins}>
          <PluginDisabledMessage pluginId="bids" pluginLabel="BIDS Management" />
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell plugins={plugins}>
        <RequestsContent />
      </AppShell>
    </AuthGuard>
  );
}
