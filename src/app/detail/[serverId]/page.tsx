import { getServerById, getAllServers, getOverdueBackupsForServer, getLastOverdueBackupCheckTime } from "@/lib/db-utils";
import { DetailAutoRefresh } from "@/components/server-details/detail-auto-refresh";
import { notFound } from 'next/navigation';
import type { Server } from "@/lib/types";
import { BackupSelectionProvider } from "@/contexts/backup-selection-context";

// Add cache control headers to the response
export async function generateMetadata() {
  return {
    other: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  };
}

export async function generateStaticParams() {
  const servers = await getAllServers();
  if (!servers) return [];
  
  return servers.map((server: Server) => ({
    serverId: server.id,
  }));
}

// Define the correct type for the page props
type PageProps = {
  params: Promise<{
    serverId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = 'force-dynamic';

export default async function ServerDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { serverId } = await params;
  const resolvedSearchParams = await searchParams;
  const server = await getServerById(serverId);
  
  if (!server) {
    notFound();
  }

      // Get overdue backups for this server
    const overdueBackups = getOverdueBackupsForServer(server.name);

    // Get the last overdue backup check time
    const lastOverdueCheck = getLastOverdueBackupCheckTime();

  // Get the backup name from the URL if it exists
  const backupName = resolvedSearchParams.backup as string | undefined;

  return (
    <BackupSelectionProvider initialBackup={backupName || 'all'}>
      <DetailAutoRefresh 
        initialData={{
          server,
          overdueBackups,
          lastOverdueCheck
        }} 
      />
    </BackupSelectionProvider>
  );
} 