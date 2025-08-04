"use client";

import { useState, useEffect } from 'react';
import { MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface NtfyConfig {
  url: string;
  topic: string;
}

export function NtfyMessagesButton() {
  const [ntfyConfig, setNtfyConfig] = useState<NtfyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNtfyConfig = async () => {
      try {
        const response = await fetch('/api/configuration');
        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }
        const data = await response.json();
        setNtfyConfig(data.ntfy);
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

    fetchNtfyConfig();
  }, [toast]);

  const handleOpenNtfyMessages = () => {
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
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleOpenNtfyMessages}
      disabled={isLoading || !ntfyConfig?.topic}
      title="View ntfy messages"
    >
      <MessagesSquare className="h-4 w-4" />
    </Button>
  );
} 