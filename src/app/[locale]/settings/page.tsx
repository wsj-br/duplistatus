import { requireServerAuth } from "@/lib/auth-server";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
