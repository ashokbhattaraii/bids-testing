'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { HospitalsContent } from '@/components/hospitals/hospitals-content';

export default function HospitalsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <HospitalsContent />
      </AppShell>
    </AuthGuard>
  );
}
