"use client";

import { useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface NtfyConfig {
  url: string;
  topic: string;
  accessToken?: string;
}

export function NtfyMessagesButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenNtfyMessages = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/configuration');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      const ntfyConfig: NtfyConfig | null = data.ntfy;

      if (!ntfyConfig?.topic) {
        toast({
          title: "Error",
          description: "NTFY topic not configured",
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
        title: "Error",
        description: "Failed to load NTFY configuration",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleOpenNtfyMessages}
      disabled={isLoading}
      title="View ntfy messages"
    >
      <MessagesSquare className="h-4 w-4" />
    </Button>
  );
} 