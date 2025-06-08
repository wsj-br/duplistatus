import { getMachineById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface BackupLogPageProps {
  params: Promise<{
    machineId: string;
    backupId: string;
  }>;
}

const cleanLogMessage = (message: string): string => {
  return message.replace(/\[.*?\]:/g, '');
};

const getLogSectionBorderClass = (variant: "default" | "destructive" | "warning") => {
  switch (variant) {
    case "destructive": return "border-red-500";
    case "warning": return "border-yellow-500";
    default: return "";
  }
};

const getLogSectionTitleClass = (variant: "default" | "destructive" | "warning") => {
  switch (variant) {
    case "destructive": return "text-red-600";
    case "warning": return "text-yellow-600";
    default: return "";
  }
};

const LogSection = ({ title, items, variant = "default" }: { 
  title: string; 
  items: string[]; 
  variant?: "default" | "destructive" | "warning" 
}) => {
  if (items.length === 0) return null;

  return (
    <Card className={getLogSectionBorderClass(variant)}>
      <CardHeader>
        <CardTitle className={getLogSectionTitleClass(variant)}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="bg-muted text-muted-foreground border rounded-md p-3 font-mono text-xs custom-scrollbar"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
            width: '100%'
          }}
        >
          {items.map((item, index) => (
            <div 
              key={index} 
              className="text-foreground leading-tight"
              style={{ whiteSpace: 'nowrap' }}
            >
              {cleanLogMessage(item)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default async function BackupLogPage({ params }: BackupLogPageProps) {
  const { machineId, backupId } = await params;
  
  // Add error handling for database operations
  let machine;
  try {
    machine = await getMachineById(machineId);
  } catch (error) {
    console.error('Failed to fetch machine data:', error);
    // Return a more user-friendly error page
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Unable to load backup data. The database may be temporarily unavailable.
              Please try again later or contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!machine) {
    notFound();
  }

  const backup = machine.backups?.find(b => b.id === backupId);
  if (!backup) {
    notFound();
  }

  const parseJsonArray = (jsonString: string | null): string[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return [];
    }
  };

  const messages = parseJsonArray(backup.messages_array || null);
  const warnings = parseJsonArray(backup.warnings_array || null);
  const errors = parseJsonArray(backup.errors_array || null);

  // Ensure all required properties exist with fallbacks
  const safeBackup = {
    ...backup,
    messages: backup.messages ?? 0,
    warnings: backup.warnings ?? 0,
    errors: backup.errors ?? 0,
    name: backup.name ?? 'Unknown',
    date: backup.date ? new Date(backup.date).toISOString() : new Date().toISOString(),
    status: backup.status ?? 'Failed' as const
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/detail/${machineId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/detail/${machineId}`}>
          <h1 className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors">return to {machine.name} backup list</h1>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Backup Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Backup Details - {machine.name}</CardTitle>
              </div>
              <StatusBadge status={safeBackup.status} />
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-2">Backup Information</dt>
                <dd className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Date:</span>
                    <span>{new Date(safeBackup.date).toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">
                      ({formatDistanceToNow(new Date(safeBackup.date), { addSuffix: true })})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Name:</span>
                    <span>{safeBackup.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">ID:</span>
                    <span>{backupId}</span>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-2">Log Summary</dt>
                <dd className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Messages: {safeBackup.messages.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Warnings: {safeBackup.warnings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Errors: {safeBackup.errors.toLocaleString()}</span>
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Log Sections */}
        <LogSection title="Errors" items={errors} variant="destructive" />
        <LogSection title="Warnings" items={warnings} variant="warning" />
        <LogSection title="Messages" items={messages} variant="default" />
        <span className="text-xs text-muted-foreground ml-3">Note: the number of messages can be limited by the Duplicati configuration.</span>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // This is a placeholder function - Next.js expects it to return params
  // You would need to implement actual data fetching here if needed
  return [];
} 