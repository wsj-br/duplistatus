import { getMachinesSummary, getOverallSummary, getAllMachinesChartData, ensureBackupSettingsComplete } from "@/lib/db-utils";
import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add cache control headers to the response
export async function generateMetadata() {
  return {
    other: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  };
}

export default async function DashboardPage() {
  // Fetch initial data server-side
  const machinesSummary = await getMachinesSummary();
  
  // Ensure backup settings are complete for all machines and backups
  // This will add default settings for any missing machine-backup combinations
  await ensureBackupSettingsComplete();
  
  const overallSummary = await getOverallSummary();
  const allMachinesChartData = await getAllMachinesChartData();

  const initialData = {
    machinesSummary,
    overallSummary,
    allMachinesChartData
  };

  return <DashboardAutoRefresh initialData={initialData} />;
}
