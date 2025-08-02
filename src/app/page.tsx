import { getMachinesSummary, getOverallSummary, getAggregatedChartData } from "@/lib/db-utils";
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
  const machinesSummary = getMachinesSummary();
  const overallSummary = await getOverallSummary();
  const aggregatedChartData = await getAggregatedChartData();

  const initialData = {
    machinesSummary,
    overallSummary,
    aggregatedChartData
  };

  return <DashboardAutoRefresh initialData={initialData} />;
}
