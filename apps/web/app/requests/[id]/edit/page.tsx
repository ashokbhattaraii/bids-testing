'use client';

import { use } from 'react';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { PluginDisabledMessage } from '@/components/plugin-disabled-message';
import { EditRequestPageContent } from '@/components/requests/edit-request-page';
import { usePluginStore } from '@/lib/plugins/plugin-store';
import { getRegisteredPlugins } from '@/lib/plugins';

const plugins = getRegisteredPlugins();

export default function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
        <EditRequestPageContent key={id} id={id} />
      </AppShell>
    </AuthGuard>
  );
}
