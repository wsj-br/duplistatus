import { getServersSummary, getOverallSummaryFromServers, getAggregatedChartData, getConfigBackupSettings } from "@/lib/db-utils";
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
  // Ensure backup settings are complete for all servers and backups
  // This will add default settings for any missing server-backup combinations
  // Ensure backup settings are complete (now handled automatically by getConfigBackupSettings)
  await getConfigBackupSettings();
  
  // Get serversSummary first, then use it for overallSummary to avoid duplicate overdue checks
  const serversSummary = await getServersSummary();
  const overallSummary = await getOverallSummaryFromServers(serversSummary);
  const allServersChartData = await getAggregatedChartData();

  const initialData = {
    serversSummary,
    overallSummary,
    allServersChartData
  };

  return <DashboardAutoRefresh initialData={initialData} />;
}
