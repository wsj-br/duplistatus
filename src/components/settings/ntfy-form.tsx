"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { QrCode, MessageSquare, Key, Globe, SendHorizonal, Loader2 } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import QRCode from 'qrcode';
import { NtfyConfig } from '@/lib/types';
import { NtfyQrModal } from '@/components/ui/ntfy-qr-modal';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { useIntlayer } from 'react-intlayer';

interface NtfyFormProps {
  config: NtfyConfig;
  onSave: (config: NtfyConfig) => Promise<{ ntfy?: NtfyConfig } | void>;
}

export function NtfyForm({ config, onSave }: NtfyFormProps) {
  const content = useIntlayer('ntfy-form');
  const common = useIntlayer('common');
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
        title: content.validationError.value,
        description: content.pleaseEnterBothUrlAndTopic.value,
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
        title: content.qrCodeGenerationFailed.value,
        description: content.failedToGenerateQrCode.value,
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
        title: content.validationError.value,
        description: content.pleaseEnterBothUrlAndTopicForTest.value,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'simple',
          ntfyConfig: formData 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || content.failedToSendTestNotification.value);
      }

      toast({
        title: content.testSuccessful.value,
        description: content.testNotificationSentSuccessfully.value,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sending test notification:', error instanceof Error ? error.message : String(error));
      toast({
        title: content.testFailed.value,
        description: error instanceof Error ? error.message : content.failedToSendTestNotification.value,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={MessageSquare} color="blue" size="lg" />
            <div>
              <CardTitle>{content.title.value}</CardTitle>
              <CardDescription className="mt-1">
                {content.description.value}
                {' '}
                {content.cardDescLearnMore.value}
                {' '}
                <a 
                  href="https://docs.ntfy.sh/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  docs.ntfy.sh
                </a>
                {' '}{content.cardDescAnd.value}{' '}
                <a 
                  href="https://docs.ntfy.sh/subscribe/phone/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  {content.cardDescHere.value}
                </a>
                {' '}{content.cardDescSubscribe.value}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ntfy-url" className="flex items-center gap-2">
              <ColoredIcon icon={Globe} color="blue" size="sm" />
              {content.ntfyUrl.value}
            </Label>
            <Input
              id="ntfy-url"
              value={formData.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder={content.ntfyUrlPlaceholder.value}
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              {content.ntfyUrlDescPrefix.value} <a href="https://ntfy.sh/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ntfy.sh/</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntfy-topic" className="flex items-center gap-2">
              <ColoredIcon icon={MessageSquare} color="green" size="sm" />
              {content.ntfyTopic.value}
            </Label>
            <Input
              id="ntfy-topic"
              value={formData.topic || ''}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder={content.ntfyTopicPlaceholder.value}
            />
            <p className="text-sm text-muted-foreground">
                {content.ntfyTopicDescription.value}{' '}
                <a
                  href={`https://ntfy.sh/${formData.topic || content.ntfyTopicPlaceholder.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ntfy.sh/{formData.topic || content.ntfyTopicPlaceholder.value}
                </a>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntfy-access-token" className="flex items-center gap-2">
              <ColoredIcon icon={Key} color="yellow" size="sm" />
              {content.ntfyAccessTokenOptional.value}
            </Label>
            <TogglePasswordInput
              id="ntfy-access-token"
              value={formData.accessToken || ''}
              onChange={(value) => handleInputChange('accessToken', value)}
              placeholder={content.ntfyAccessTokenPlaceholder.value}
            />
            <p className="text-sm text-muted-foreground">
            {content.ntfyAccessTokenDescPrefix.value}{' '}
              <a 
                href="https://docs.ntfy.sh/config/#access-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {content.ntfyAccessTokenDescLink.value}
              </a>  {content.ntfyAccessTokenDescSuffix.value}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              {isSaving ? content.saving.value : content.saveSettings.value}
            </Button>

            <Button
              onClick={handleTestMessage}
              disabled={isTesting || !formData.url || !formData.topic}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {content.sending.value}
                </>
              ) : (
                <>
                  <SendHorizonal className="w-4 h-4" />
                  {content.sendTestMessage.value}
                </>
              )}
            </Button>
            <Button
              onClick={generateQrCode}
              variant="outline"
              disabled={!formData.url || !formData.topic}
              className="w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {content.configureDevice.value}
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