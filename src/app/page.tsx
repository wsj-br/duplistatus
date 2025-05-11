import { getMachinesSummary, getOverallSummary } from "@/lib/data";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const machinesSummary = await getMachinesSummary();
  const overallSummary = await getOverallSummary();

  return (
    <div className="flex flex-col gap-8">
      <DashboardSummaryCards summary={overallSummary} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Dashboard Overview</CardTitle>
          <CardDescription>Latest backup status for all machines.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardTable machines={machinesSummary} />
        </CardContent>
      </Card>
    </div>
  );
}
