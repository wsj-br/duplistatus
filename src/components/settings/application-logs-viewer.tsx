'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIntlayer } from 'react-intlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { RefreshCcw, Download, Copy, Terminal, Search, X, ArrowDownFromLine, ArrowDownToLine } from 'lucide-react';

interface LogData {
  logs: string;
  fileSize: number;
  lastModified: string;
  lineCount: number;
  currentFile: string; // Actual filename: 'application.log', 'application.log.1', etc.
  availableFiles: string[]; // Array of actual filenames: ['application.log', 'application.log.1', ...]
}

interface ApplicationLogsViewerProps {
  // No props needed - this is a standalone viewer
}

export function ApplicationLogsViewer({}: ApplicationLogsViewerProps) {
  const content = useIntlayer('application-logs-viewer');
  const common = useIntlayer('common');
  const { toast } = useToast();
  const [logData, setLogData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>(''); // Will be set from API response
  const [baseLogFileName, setBaseLogFileName] = useState<string>(''); // Derived from availableFiles
  const [tail, setTail] = useState<number>(1000);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchString, setSearchString] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastModifiedRef = useRef<string | null>(null);
  const lastLineCountRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Derive base log filename from available files (the one without .N suffix)
  const deriveBaseFileName = (availableFiles: string[]): string => {
    if (availableFiles.length === 0) return '';
    // Find the file that doesn't have a .N suffix (where N is a number)
    const baseFile = availableFiles.find(file => !/\.\d+$/.test(file));
    return baseFile || availableFiles[0]; // Fallback to first file if all are rotated
  };

  // Helper: Check if a filename is the current (base) log file
  const isCurrentFile = useCallback((fileName: string): boolean => {
    if (!baseLogFileName) return false;
    return fileName === baseLogFileName;
  }, [baseLogFileName]);

  // Helper: Get display name for a file
  const getFileDisplayName = (fileName: string): string => {
    if (isCurrentFile(fileName)) {
      return content.current;
    }
    // Extract the number from 'baseFileName.1' -> '.1'
    if (baseLogFileName && fileName.startsWith(baseLogFileName + '.')) {
      const match = fileName.match(/\.(\d+)$/);
      return match ? `.${match[1]}` : fileName;
    }
    return fileName;
  };

  // Load logs
  const loadLogs = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const params = new URLSearchParams({
        tail: tail.toString(),
      });
      
      // Only add file parameter if selectedFile is set
      if (selectedFile) {
        params.append('file', selectedFile);
      }

      const response = await authenticatedRequestWithRecovery(`/api/application-logs?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load logs' }));
        
        // If the file doesn't exist but we have available files, switch to the first available
        if (errorData.availableFiles && Array.isArray(errorData.availableFiles) && errorData.availableFiles.length > 0) {
          // Derive base log filename from available files if not set yet
          if (!baseLogFileName) {
            const derivedBase = deriveBaseFileName(errorData.availableFiles);
            setBaseLogFileName(derivedBase);
          }
          
          const firstAvailable = errorData.availableFiles[0];
          if (firstAvailable !== selectedFile) {
            setSelectedFile(firstAvailable);
            // Don't continue processing this error response since we need to reload with the new file
            if (!silent) {
              setLoading(false);
            }
            return;
          }
        }
        
        throw new Error(errorData.error || 'Failed to load logs');
      }

      const data: LogData = await response.json();
      
      // Derive base log filename from available files if not set yet
      if (!baseLogFileName && data.availableFiles.length > 0) {
        const derivedBase = deriveBaseFileName(data.availableFiles);
        setBaseLogFileName(derivedBase);
      }
      
      // Initialize selectedFile if not set yet (first load - when no file parameter was sent)
      if (!selectedFile && data.availableFiles.length > 0) {
        const baseFile = deriveBaseFileName(data.availableFiles);
        setSelectedFile(baseFile);
        // Reload with the correct file
        if (!silent) {
          setLoading(false);
        }
        return;
      }
      
      // If we got an empty response (no file requested), don't try to display logs
      if (!data.currentFile && !selectedFile) {
        if (!silent) {
          setLoading(false);
        }
        return;
      }
      
      // If the currently selected file is not in the available files list, switch to the first available file
      if (data.availableFiles.length > 0 && !data.availableFiles.includes(selectedFile)) {
        const firstAvailable = data.availableFiles[0];
        // Only switch if we're not already loading that file (avoid infinite loops)
        if (firstAvailable !== selectedFile) {
          setSelectedFile(firstAvailable);
          // Don't continue processing this response since we need to reload with the new file
          if (!silent) {
            setLoading(false);
          }
          return;
        }
      }
      
      // Verify that the file we received matches what we requested
      if (data.currentFile !== selectedFile) {
        console.error(`File mismatch: requested "${selectedFile}", got "${data.currentFile}". This indicates a bug.`);
        // If there's a mismatch, don't display the wrong data - reload with correct file
        if (!silent) {
        toast({
          title: common.status.error,
          description: content.fileMismatch,
          variant: 'destructive',
        });
        }
        if (!silent) {
          setLoading(false);
        }
        return;
      }
      
      // Check if there are actually new lines
      const isFirstLoad = lastLineCountRef.current === 0;
      const hasNewLines = data.lineCount > lastLineCountRef.current;
      
      // Update refs
      lastModifiedRef.current = data.lastModified;
      lastLineCountRef.current = data.lineCount;
      
      setLogData(data);
      
      // Auto-scroll only when there are actually new lines (or on first load)
      // Only scroll if auto-scroll is enabled, viewing current file, and there are new lines
      if (autoScroll && isCurrentFile(selectedFile) && (isFirstLoad || hasNewLines) && scrollContainerRef.current) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        });
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load logs',
          variant: 'destructive',
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [selectedFile, tail, toast, autoScroll, baseLogFileName, isCurrentFile, common.status.error, content.fileMismatch]);

  // Initial load and when filters change
  useEffect(() => {
    loadLogs();
    // Reset tracking refs when filters change
    lastModifiedRef.current = null;
    lastLineCountRef.current = 0;
  }, [loadLogs]);

  // Auto-scroll to bottom only when auto-scroll is toggled on or selected file changes.
  // Do NOT depend on logData: scrolling on new log lines is handled in loadLogs (hasNewLines).
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current && logData && isCurrentFile(selectedFile)) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [autoScroll, selectedFile, isCurrentFile]); // Intentionally omit logData so we don't scroll on every poll, only when new lines arrive (handled in loadLogs)

  // Polling for current log file when auto-scroll is enabled
  useEffect(() => {
    // Only poll if viewing current file and auto-scroll is enabled
    if (isCurrentFile(selectedFile) && autoScroll) {
      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadLogs(true); // Silent refresh
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    } else {
      // Clear polling when not viewing current or auto-scroll is disabled
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [selectedFile, autoScroll, loadLogs, isCurrentFile]);

  // Filter logs based on search string
  const filteredLogs = useMemo(() => {
    if (!logData?.logs) return [];
    
    const lines = logData.logs.split('\n');
    return lines.filter(line => {
      // Filter by search string
      if (searchString && !line.toLowerCase().includes(searchString.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [logData, searchString]);


  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filteredLogs.join('\n'));
      toast({
        title: 'Success',
        description: 'Logs copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
        toast({
          title: common.status.error,
          description: content.failedToCopy,
          variant: 'destructive',
        });
    }
  };

  // Export logs
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        logLevels: 'INFO,WARN,ERROR', // Export all log levels
      });
      if (searchString) {
        params.append('search', searchString);
      }
      // Always send the actual filename
      params.append('file', selectedFile);

      const response = await authenticatedRequestWithRecovery(`/api/application-logs/export?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to export logs' }));
        throw new Error(errorData.error || 'Failed to export logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `duplistatus-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: common.status.success,
        description: content.logsExported,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export logs',
        variant: 'destructive',
      });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="space-y-4" data-screenshot-target="settings-content-card">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          {content.title}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => loadLogs(false)}
          disabled={loading}
          title={content.refreshLogs}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {content.refresh}
        </Button>
      </div>

      {/* Controls */}
      <div className="border rounded-md p-4 space-y-4 bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* File Selector (rotated files) */}
          {logData && (
            <div className="space-y-2">
              <Label htmlFor="file">File Version</Label>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger id="file" className="w-auto min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logData.availableFiles.map(file => (
                    <SelectItem key={file} value={file}>
                      {getFileDisplayName(file)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search String Filter - 50% width, left-justified */}
          <div className="space-y-2 w-full md:w-1/2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Input
                id="search"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Filter by text (case-insensitive)"
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searchString ? (
                  <button
                    type="button"
                    onClick={() => setSearchString('')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Right-justified controls container */}
          <div className="flex flex-col md:flex-row gap-4 ml-auto">
            {/* Line Count Selector - Second, smaller */}
            <div className="space-y-2">
              <Label htmlFor="tail">Lines to Show</Label>
              <Select value={tail.toString()} onValueChange={(value) => setTail(parseInt(value, 10))}>
                <SelectTrigger id="tail" className="w-auto min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="5000">5000</SelectItem>
                  <SelectItem value="10000">10000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-scroll Toggle - Third, smaller */}
            <div className="space-y-2">
              <Label htmlFor="auto-scroll">{content.autoScroll}</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={(checked: boolean) => setAutoScroll(checked === true)}
                />
                <Label htmlFor="auto-scroll" className="text-sm font-normal cursor-pointer whitespace-nowrap">
                  {content.enableAutoScroll}
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            {content.copy}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {content.download}
          </Button>
        </div>
      </div>

      {/* Log Display */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{content.loadingLogs}</div>
      ) : !logData || filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {logData && logData.logs ? content.noLogsMatch : content.noLogsAvailable}
        </div>
      ) : (
        <div className="border rounded-md">
          <div className="p-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
            <span>
              {content.showingLines.value.replace('{filtered}', filteredLogs.length.toString()).replace('{total}', logData.lineCount.toString())}
              {logData.fileSize > 0 && ` (${(logData.fileSize / 1024).toFixed(2)} KB)`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="h-7 px-2"
                title={content.scrollToTop.value}
              >
                <ArrowDownFromLine className="h-4 w-4" />
              
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToBottom}
                className="h-7 px-2"
                title={content.scrollToBottom.value}
              >
                <ArrowDownToLine className="h-4 w-4" />
               
              </Button>
            </div>
            <span>
              {content.lastModified} {new Date(logData.lastModified).toLocaleString()}
            </span>
          </div>
          <div
            ref={scrollContainerRef}
            className="max-h-[calc(100vh-500px)] overflow-y-auto font-mono text-sm p-4 bg-background"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {filteredLogs.map((line, index) => (
              <div key={index}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
