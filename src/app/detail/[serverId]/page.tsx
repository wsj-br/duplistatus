import { getServerById, getAllServers, getOverdueBackupsForServer, getLastOverdueBackupCheckTime, invalidateDataCache, clearRequestCache } from "@/lib/db-utils";
import { DetailAutoRefresh } from "@/components/server-details/detail-auto-refresh";
import { notFound } from "next/navigation";
import type { Server } from "@/lib/types";
import { BackupSelectionProvider } from "@/contexts/backup-selection-context";
import { requireServerAuth } from "@/lib/auth-server";

const LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;

// Add cache control headers to the response
export async function generateMetadata() {
  return {
    other: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  };
}

export async function generateStaticParams() {
  const servers = await getAllServers();
  if (!servers) return [];
  const list: { locale: string; serverId: string }[] = [];
  for (const locale of LOCALES) {
    for (const server of servers as Server[]) {
      list.push({ locale, serverId: server.id });
    }
  }
  return list;
}

type PageProps = {
  params: Promise<{ locale: string; serverId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = "force-dynamic";

export default async function ServerDetailsPage({
  params,
  searchParams,
}: PageProps) {
  await requireServerAuth();

  // Ensure fresh data on initial load (same as /api/detail/[serverId]); avoids stale
  // requestCache so overdue message and other data show immediately, not only after auto-refresh.
  invalidateDataCache();
  clearRequestCache();

  const { serverId } = await params;
  const resolvedSearchParams = await searchParams;
  const server = await getServerById(serverId);

  if (!server) {
    notFound();
  }

  const overdueBackups = await getOverdueBackupsForServer(server.id);
  const lastOverdueCheck = getLastOverdueBackupCheckTime();

  const backupName = resolvedSearchParams.backup as string | undefined;

  return (
    <BackupSelectionProvider initialBackup={backupName || "all"}>
      <DetailAutoRefresh
        initialData={{
          server,
          overdueBackups,
          lastOverdueCheck,
        }}
      />
    </BackupSelectionProvider>
  );
}
