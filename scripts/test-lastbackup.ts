import { dbOps } from '../src/lib/db';

interface Machine {
  id: string;
  name: string;
}

async function testLastBackup(machineName?: string) {
  try {
    // Use provided machine name or default to "Test Machine 1"
    const machineNameToUse = machineName || "Test Machine 1";

    console.log(`Testing last backup for machine: ${machineNameToUse}`);
    // Make request to the endpoint
    const response = await fetch(`http://localhost:9666/api/lastbackup/${machineNameToUse}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, error: ${errorData.error}, message: ${errorData.message}`);
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