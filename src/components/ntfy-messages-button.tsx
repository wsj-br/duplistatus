"use client";

import { useState } from 'react';
import { useIntlayer } from 'react-intlayer';
import { NotificationIcon } from '@/components/ui/notification-icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';
import { NtfyQrModal } from '@/components/ui/ntfy-qr-modal';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';

interface NtfyConfig {
  url: string;
  topic: string;
  accessToken?: string;
}

export function NtfyMessagesButton() {
  const content = useIntlayer('ntfy-messages-button');
  const common = useIntlayer('common');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [topicUrl, setTopicUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async (ntfyConfig: NtfyConfig) => {
    try {
      // Extract server URL from the NTFY URL (remove trailing slash)
      const serverUrl = ntfyConfig.url.replace(/\/$/, '');
      const topic = ntfyConfig.topic;
      
      // Build the NTFY URL for phone configuration
      let ntfyUrl = `ntfy://${serverUrl.replace(/^https?:\/\//, '')}/${topic}`;
      
      // Add access token if configured
      if (ntfyConfig.accessToken && ntfyConfig.accessToken.trim() !== '') {
        ntfyUrl += `?auth=tk_${ntfyConfig.accessToken}`;
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
        title: content.qrGenerationFailedTitle.value,
        description: content.qrGenerationFailedDescription.value,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleOpenNtfyMessages = async () => {
    setIsLoading(true);
    
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/ntfy');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      const ntfyConfig: NtfyConfig | null = data.ntfy;

      if (!ntfyConfig?.topic) {
        toast({
          title: common.ui.error.value,
          description: content.topicNotConfigured.value,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const ntfyUrl = `https://ntfy.sh/${ntfyConfig.topic}`;
      window.open(ntfyUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error fetching NTFY configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: common.ui.error.value,
        description: content.failedToLoadConfig.value,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRightClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/ntfy');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      const ntfyConfig: NtfyConfig | null = data.ntfy;

      if (!ntfyConfig?.topic) {
        toast({
          title: common.ui.error.value,
          description: content.topicNotConfigured.value,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await generateQrCode(ntfyConfig);
    } catch (error) {
      console.error('Error fetching NTFY configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: common.ui.error.value,
        description: content.failedToLoadConfig.value,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleOpenNtfyMessages}
        onContextMenu={handleRightClick}
        disabled={isLoading}
        title={content.buttonTitle.value}
      >
        <NotificationIcon className="h-4 w-4" />
      </Button>

      {/* QR Code Modal */}
      <NtfyQrModal 
        isOpen={isQrModalOpen} 
        onOpenChange={setIsQrModalOpen} 
        qrCodeDataUrl={qrCodeDataUrl} 
        topicUrl={topicUrl}
      />
    </>
  );
} 