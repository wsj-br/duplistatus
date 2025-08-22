"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { NtfyConfig } from '@/lib/types';

interface NtfyFormProps {
  config: NtfyConfig;
  onSave: (config: NtfyConfig) => Promise<{ ntfy?: NtfyConfig } | void>;
}

export function NtfyForm({ config, onSave }: NtfyFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NtfyConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (field: keyof NtfyConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const wasTopicEmpty = !formData.topic || formData.topic.trim() === '';
      const result = await onSave(formData);
      
      // If the topic was empty, check if the API returned an updated configuration
      if (wasTopicEmpty && result && result.ntfy && result.ntfy.topic) {
        setFormData(prev => ({
          ...prev,
          topic: result.ntfy!.topic
        }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMessage = async () => {
    if (!formData.url || !formData.topic) {
      toast({
        title: "Validation Error",
        description: "Please enter both NTFY URL and Topic before testing",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ntfyConfig: formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      toast({
        title: "Test Successful",
        description: "Test notification sent successfully! Check your device.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sending test notification:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test notification",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NTFY Configuration</CardTitle>
          <CardDescription>
            Configure your NTFY server settings for receiving notifications. 
            Learn more about NTFY at{' '}
            <a 
              href="https://docs.ntfy.sh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              docs.ntfy.sh 
            </a>
            {' '} and <a href="https://docs.ntfy.sh/subscribe/phone/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">here</a> to subscribe to your topic in your phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ntfy-url">NTFY URL</Label>
            <Input
              id="ntfy-url"
              value={formData.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://ntfy.sh/"
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              The URL of your NTFY server. Defaults to <a href="https://ntfy.sh/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ntfy.sh/</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntfy-topic">NTFY Topic</Label>
            <Input
              id="ntfy-topic"
              value={formData.topic || ''}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="duplistatus-my-notification-topic"
            />
            <p className="text-sm text-muted-foreground">
                Leave empty to automatically generate a random name when you save.
                You can view this topic at{' '}
                <a
                  href={`https://ntfy.sh/${formData.topic || 'duplistatus-my-notification-topic'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ntfy.sh/{formData.topic || 'duplistatus-my-notification-topic'}
                </a>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntfy-access-token">NTFY Access Token (Optional)</Label>
            <TogglePasswordInput
              id="ntfy-access-token"
              value={formData.accessToken || ''}
              onChange={(value) => handleInputChange('accessToken', value)}
              placeholder="Enter your NTFY access token"
            />
            <p className="text-sm text-muted-foreground">
            If your NTFY server requires authentication, please enter your access token.
            For more details, refer to the {' '}
              <a 
                href="https://docs.ntfy.sh/config/#access-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                NTFY authentication
              </a>  documentation.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
          <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              onClick={handleTestMessage}
              variant="outline"
              disabled={isTesting || !formData.url || !formData.topic}
            >
              {isTesting ? "Sending..." : "Send Test Message"}
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
} 