"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { QrCode, MessageSquare, Key, Globe } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import QRCode from 'qrcode';
import { NtfyConfig } from '@/lib/types';
import { NtfyQrModal } from '@/components/ui/ntfy-qr-modal';

interface NtfyFormProps {
  config: NtfyConfig;
  onSave: (config: NtfyConfig) => Promise<{ ntfy?: NtfyConfig } | void>;
}

export function NtfyForm({ config, onSave }: NtfyFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NtfyConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [topicUrl, setTopicUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleInputChange = (field: keyof NtfyConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateQrCode = async () => {
    if (!formData.url || !formData.topic) {
      toast({
        title: "Validation Error",
        description: "Please enter both NTFY URL and Topic before generating QR code",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Extract server URL from the NTFY URL (remove trailing slash)
      const serverUrl = formData.url.replace(/\/$/, '');
      const topic = formData.topic;
      
      // Build the NTFY URL for phone configuration
      let ntfyUrl = `ntfy://${serverUrl.replace(/^https?:\/\//, '')}/${topic}`;
      
      // Add access token if configured
      if (formData.accessToken && formData.accessToken.trim() !== '') {
        ntfyUrl += `?auth=tk_${formData.accessToken}`;
      }

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(ntfyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      setTopicUrl(ntfyUrl);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
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
        body: JSON.stringify({ 
          type: 'simple',
          ntfyConfig: formData 
        }),
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
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={MessageSquare} color="blue" size="lg" />
            <div>
              <CardTitle>NTFY Configuration</CardTitle>
              <CardDescription className="mt-1">
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ntfy-url" className="flex items-center gap-2">
              <ColoredIcon icon={Globe} color="blue" size="sm" />
              NTFY URL
            </Label>
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
            <Label htmlFor="ntfy-topic" className="flex items-center gap-2">
              <ColoredIcon icon={MessageSquare} color="green" size="sm" />
              NTFY Topic
            </Label>
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
            <Label htmlFor="ntfy-access-token" className="flex items-center gap-2">
              <ColoredIcon icon={Key} color="yellow" size="sm" />
              NTFY Access Token (Optional)
            </Label>
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              onClick={handleTestMessage}
              variant="outline"
              disabled={isTesting || !formData.url || !formData.topic}
              className="w-full sm:w-auto"
            >
              {isTesting ? "Sending..." : "Send Test Message"}
            </Button>
            <Button
              onClick={generateQrCode}
              variant="outline"
              disabled={!formData.url || !formData.topic}
              className="w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Configure Device
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <NtfyQrModal 
        isOpen={isQrModalOpen} 
        onOpenChange={setIsQrModalOpen} 
        qrCodeDataUrl={qrCodeDataUrl} 
        topicUrl={topicUrl}
      />
    </div>
  );
}