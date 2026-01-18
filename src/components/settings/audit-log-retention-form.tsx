"use client";

import { useState, useEffect } from 'react';
import { useIntlayer } from 'react-intlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { Clock } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';

interface AuditLogRetentionFormProps {
  isAdmin: boolean;
}

export function AuditLogRetentionForm({ isAdmin }: AuditLogRetentionFormProps) {
  const content = useIntlayer('audit-log-retention-form');
  const common = useIntlayer('common');
  const { toast } = useToast();
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionSaving, setRetentionSaving] = useState(false);

  // Load retention configuration (admin only)
  useEffect(() => {
    if (isAdmin) {
      const loadRetention = async () => {
        try {
          setRetentionLoading(true);
          const response = await authenticatedRequestWithRecovery('/api/audit-log/retention');
          if (response.ok) {
            const data = await response.json();
            setRetentionDays(data.retentionDays || 90);
          }
        } catch (error) {
          console.error('Error loading retention:', error);
          toast({
            title: common.status.error,
            description: content.failedToLoad,
            variant: 'destructive',
          });
        } finally {
          setRetentionLoading(false);
        }
      };
      loadRetention();
    }
  }, [isAdmin, toast]);

  // Save retention configuration
  const saveRetention = async () => {
    if (!isAdmin) return;
    
    if (retentionDays < 30 || retentionDays > 365) {
      toast({
        title: 'Error',
        description: 'Retention days must be between 30 and 365',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRetentionSaving(true);
      const csrfResponse = await fetch('/api/csrf');
      const { token: csrfToken } = await csrfResponse.json();

      const response = await authenticatedRequestWithRecovery('/api/audit-log/retention', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ retentionDays }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save retention configuration');
      }

      toast({
        title: common.status.success,
        description: content.updatedSuccessfully.value.replace('{days}', retentionDays.toString()),
      });
    } catch (error) {
      console.error('Error saving retention:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save retention configuration',
        variant: 'destructive',
      });
    } finally {
      setRetentionSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{content.noPermission}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Clock} color="blue" size="md" />
            Audit Log Retention
          </CardTitle>
          <CardDescription>
            Configure how long audit logs are retained before automatic cleanup. Set the number of days audit logs should be retained. Logs older than this period will be automatically deleted during daily cleanup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="retention-days">{content.retentionDays}</Label>
              <Input
                id="retention-days"
                type="number"
                min={30}
                max={365}
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10) || 90)}
                disabled={retentionLoading || retentionSaving}
                className="w-24"
              />
            </div>
            <Button
              onClick={saveRetention}
              variant="gradient" 
              disabled={retentionLoading || retentionSaving || retentionDays < 30 || retentionDays > 365}
              size="sm"
            >
              {retentionSaving ? content.saving : content.save}
            </Button>
            <span className="text-xs text-muted-foreground">
              {content.range}
            </span>
          </div>
          
          {retentionLoading && (
            <p className="text-sm text-muted-foreground">{content.loadingRetention}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

