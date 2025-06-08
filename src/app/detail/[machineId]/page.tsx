import { getMachineById, getAllMachines } from "@/lib/data";
import { MachineDetailsContent } from "@/components/machine-details/machine-details-content";
import { notFound } from 'next/navigation';
import type { Machine } from "@/lib/types";

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
  params: {
    machineId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function MachineDetailsPage({
  params,
}: PageProps) {
  const machine = await getMachineById(params.machineId);
  
  if (!machine) {
    notFound();
  }

  return <MachineDetailsContent machine={machine} />;
} 