import { getServersSummary, getOverallSummaryFromServers, getAggregatedChartData, clearRequestCache } from "@/lib/db-utils";
import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh";
import { requireServerAuth } from "@/lib/auth-server";

// Force dynamic rendering and disable all forms of caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  // Require authentication - redirects to login if not authenticated
  await requireServerAuth();
  
  // Clear request cache at the start of each page load to ensure fresh data
  clearRequestCache();
  
  // Get serversSummary first, then use it for overallSummary to avoid duplicate overdue checks
  // Note: getServersSummary() already calls getConfigBackupSettings() internally, so we don't need to call it separately
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
