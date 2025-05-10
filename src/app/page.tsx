import { getMachinesSummary } from "@/lib/data";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const machinesSummary = getMachinesSummary();

  return (
    <div className="flex flex-col gap-8">
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
