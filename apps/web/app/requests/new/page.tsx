'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { PluginDisabledMessage } from '@/components/plugin-disabled-message';
import { NewRequestPageContent } from '@/components/requests/new-request-page';
import { usePluginStore } from '@/lib/plugins/plugin-store';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function NewRequestPage() {
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
        <NewRequestPageContent />
      </AppShell>
    </AuthGuard>
  );
}
