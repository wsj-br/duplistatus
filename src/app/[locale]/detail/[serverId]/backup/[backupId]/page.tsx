import { getServerById } from "@/lib/db-utils";
import { notFound } from "next/navigation";
import { requireServerAuth } from "@/lib/auth-server";
import { BackupDetailContent } from "@/components/server-details/backup-detail-content";

interface BackupLogPageProps {
  params: Promise<{
    locale: string;
    serverId: string;
    backupId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function BackupLogPage({ params }: BackupLogPageProps) {
  await requireServerAuth();

  const { locale, serverId, backupId } = await params;

  let server;
  try {
    server = await getServerById(serverId);
  } catch (error) {
    console.error("Failed to fetch server data:", error instanceof Error ? error.message : String(error));
    return (
      <BackupDetailContent
        server={null}
        backupId={backupId}
        locale={locale}
        error={true}
      />
    );
  }

  if (!server) notFound();

  const backup = server.backups?.find((b) => b.id === backupId);
  if (!backup) notFound();

  return (
    <BackupDetailContent
      server={server}
      backup={backup}
      backupId={backupId}
      locale={locale}
    />
  );
}
