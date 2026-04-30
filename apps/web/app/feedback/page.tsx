'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { FeedbackContent } from '@/components/feedback/feedback-content';

export default function FeedbackPage() {
  return (
    <AuthGuard>
      <AppShell>
        <FeedbackContent />
      </AppShell>
    </AuthGuard>
  );
}
