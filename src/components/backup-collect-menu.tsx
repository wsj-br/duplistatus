"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function BackupCollectMenu() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("8200");
  const [password, setPassword] = useState("");
  const [useHttps, setUseHttps] = useState(false);
  const [allowSelfSigned, setAllowSelfSigned] = useState(false);
  const [stats, setStats] = useState<{ processed: number; skipped: number; errors: number } | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleCollect = async () => {
    if (!hostname) {
      toast({
        title: "Error",
        description: "Please enter a hostname",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCollecting(true);
      setStats(null);

      const response = await fetch('/api/backups/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hostname, 
          port: parseInt(port) || 8200,
          password,
          protocol: useHttps ? 'https' : 'http',
          allowSelfSigned
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to collect backups');
      }

      const result = await response.json();
      setStats(result.stats);

      // Show success toast
      toast({
        title: "Backups collected successfully",
        description: `Processed: ${result.stats.processed}, Skipped: ${result.stats.skipped}, Errors: ${result.stats.errors}`,
        variant: "default",
        duration: 5000,
      });

      // Refresh the page data
      router.refresh();

      // Clear stats and sensitive data after a delay
      setTimeout(() => {
        setStats(null);
        // Clear sensitive data
        setPassword("");
      }, 5000);

    } catch (error) {
      console.error('Error collecting backups:', error);
      
      // Show error toast
      toast({
        title: "Failed to collect backups",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Collect Backup Logs</h4>
            <p className="text-sm text-muted-foreground">
              Download backup logs directly from the Duplicati servers.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useHttps"
                  checked={useHttps}
                  onCheckedChange={(checked) => {
                    setUseHttps(checked as boolean);
                    if (!checked) setAllowSelfSigned(false);
                  }}
                  disabled={isCollecting}
                />
                <Label
                  htmlFor="useHttps"
                  className="text-sm font-normal"
                >
                  Use HTTPS
                </Label>
              </div>
              {useHttps && (
                <div className="flex items-center space-x-2 ml-6">
                  <Checkbox
                    id="allowSelfSigned"
                    checked={allowSelfSigned}
                    onCheckedChange={(checked) => setAllowSelfSigned(checked as boolean)}
                    disabled={isCollecting}
                  />
                  <Label
                    htmlFor="allowSelfSigned"
                    className="text-sm font-normal"
                  >
                    Allow self-signed certificates
                  </Label>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="server name or IP"
                disabled={isCollecting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8200"
                disabled={isCollecting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Duplicati password"
                disabled={isCollecting}
              />
              <a href="https://docs.duplicati.com/detailed-descriptions/duplicati-access-password" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">Password missing or lost?</a>
            </div>
            {isCollecting && (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Collecting backup logs...
                </p>
              </div>
            )}
            {stats && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Collection complete:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Processed: {stats.processed} backups</li>
                  <li>Skipped: {stats.skipped} duplicates</li>
                  <li>Errors: {stats.errors}</li>
                </ul>
              </div>
            )}
            <Button
              onClick={handleCollect}
              disabled={isCollecting || !hostname || !password}
            >
              {isCollecting ? (
                'Collecting...'
              ) : (
                'Collect Backups'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 