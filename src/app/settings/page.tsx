import { requireServerAuth } from '@/lib/auth-server';
import { SettingsPageClient } from '@/components/settings/settings-page-client';
import { Suspense } from 'react';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Require authentication - redirects to login if not authenticated
  const authContext = await requireServerAuth();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageClient 
        currentUser={{
          id: authContext.userId,
          isAdmin: authContext.isAdmin,
        }}
      />
    </Suspense>
  );
}
