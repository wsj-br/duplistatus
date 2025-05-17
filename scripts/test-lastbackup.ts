import { dbOps } from '../src/lib/db';

interface Machine {
  id: string;
  name: string;
}

async function testLastBackup(machineName?: string) {
  try {
    // Get machine ID from name
    let machineId: string;
    
    if (machineName) {
      const machine = dbOps.getMachineByName.get(machineName) as Machine | null;
      if (!machine) {
        console.error(`Machine "${machineName}" not found`);
        process.exit(1);
      }
      machineId = machine.id;
    } else {
      // Default to "Test Machine 1"
      const machine = dbOps.getMachineByName.get("Test Machine 1") as Machine | null;
      if (!machine) {
        console.error('Default machine "Test Machine 1" not found');
        process.exit(1);
      }
      machineId = machine.id;
    }

    // Make request to the endpoint
    const response = await fetch(`http://localhost:9666/api/lastbackup/${machineId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Pretty print the JSON response
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get machine name from command line arguments
const machineName = process.argv[2];
testLastBackup(machineName); 