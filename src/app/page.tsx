import { getMachinesSummary, getOverallSummary, getAggregatedChartData } from "@/lib/db-utils";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardMetricsChart } from "@/components/dashboard/dashboard-metrics-chart";
import { DashboardToastHandler } from "@/components/dashboard/dashboard-toast-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const machinesSummary = getMachinesSummary();
  const overallSummary = await getOverallSummary();
  const aggregatedChartData = await getAggregatedChartData();

  return (
    <div className="flex flex-col gap-8">
      <DashboardToastHandler />
      <DashboardSummaryCards summary={overallSummary} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Overview</CardTitle>
          <CardDescription>Latest backup status for all machines.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardTable machines={machinesSummary} />
        </CardContent>
      </Card>

      <DashboardMetricsChart aggregatedData={aggregatedChartData} />
    </div>
  );
}
