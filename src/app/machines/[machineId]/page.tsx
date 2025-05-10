import { getMachineById, getAllMachines } from "@/lib/data";
import type { Machine } from "@/lib/types";
import { MachineBackupTable } from "@/components/machine-details/machine-backup-table";
import { MachineMetricsChart } from "@/components/machine-details/machine-metrics-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MachineDetailsPageProps {
  params: {
    machineId: string;
  };
}

export async function generateStaticParams() {
  const machines = getAllMachines();
  return machines.map((machine) => ({
    machineId: machine.id,
  }));
}


export default function MachineDetailsPage({ params }: MachineDetailsPageProps) {
  const machine = getMachineById(params.machineId);

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Machine Not Found</AlertTitle>
            <AlertDescription>
            The machine with ID "{params.machineId}" could not be found. 
            It might have been removed or the ID is incorrect.
            </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
            <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{machine.name}</CardTitle>
          <CardDescription>Detailed backup history and performance metrics for {machine.name}.</CardDescription>
        </CardHeader>
      </Card>
      
      <MachineMetricsChart machine={machine} />

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>List of all backups for {machine.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <MachineBackupTable backups={machine.backups} />
        </CardContent>
      </Card>
    </div>
  );
}
