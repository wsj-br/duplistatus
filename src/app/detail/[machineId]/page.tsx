import { getMachineById, getAllMachines } from "@/lib/data";
import { MachineDetailsContent } from "@/components/machine-details/machine-details-content";
import { notFound } from 'next/navigation';
import type { Machine } from "@/lib/types";
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
  const machines = await getAllMachines();
  if (!machines) return [];
  
  return machines.map((machine: Machine) => ({
    machineId: machine.id,
  }));
}

// Define the correct type for the page props
type PageProps = {
  params: Promise<{
    machineId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = 'force-dynamic';

export default async function MachineDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { machineId } = await params;
  const resolvedSearchParams = await searchParams;
  const machine = await getMachineById(machineId);
  
  if (!machine) {
    notFound();
  }

  // Get the backup name from the URL if it exists
  const backupName = resolvedSearchParams.backup as string | undefined;

  return (
    <BackupSelectionProvider initialBackup={backupName || 'all'}>
      <MachineDetailsContent machine={machine} />
    </BackupSelectionProvider>
  );
} 