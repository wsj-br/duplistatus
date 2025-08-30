import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/db-utils';
import { dbOps } from '@/lib/db';

interface MachineRow {
  id: string;
  name: string;
  server_url: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;

    // Get machine data
    const machine = withDb(() => {
      return dbOps.getMachine.get(machineId) as MachineRow | undefined;
    });

    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      machineId,
      server_url: machine.server_url || ''
    });
  } catch (error) {
    console.error('Error fetching machine server URL:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch server URL' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await params;
    const { server_url } = await request.json();

    // Validate URL format
    if (server_url && server_url.trim() !== '') {
      try {
        const url = new URL(server_url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json(
            { error: 'URL must use HTTP or HTTPS protocol' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Update machine server URL
    const result = withDb(() => {
      return dbOps.updateMachineServerUrl.run({
        id: machineId,
        server_url: server_url || ''
      });
    });

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Get the updated machine data to include name
    const updatedMachine = withDb(() => {
      return dbOps.getMachine.get(machineId) as MachineRow | undefined;
    });

    if (!updatedMachine) {
      return NextResponse.json(
        { error: 'Machine not found after update' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Server URL updated successfully',
      machineId,
      machineName: updatedMachine.name,
      server_url: server_url || ''
    });
  } catch (error) {
    console.error('Error updating machine server URL:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update server URL' },
      { status: 500 }
    );
  }
}
